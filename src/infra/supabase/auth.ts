// infrastructure/supabase/auth.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { AuthUser, ClientProfile, PsychologistProfile, } from '../../domain/types/user.types';

dotenv.config();

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export const authService = {
  async registerClient(
    email: string,
    password: string,
    profileData: ClientProfile
  ): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'client' }
      }
    });

    if (error) throw new Error(error.message);
    if (!data.user || !data.user.email) throw new Error('User registration failed');

    // Insert client profile
    const { error: profileError } = await supabase
      .from('clients')
      .insert({
        id: data.user.id,
        ...profileData
      });

    if (profileError) throw new Error(profileError.message);

    return {
      id: data.user.id,
      email: data.user.email,
      role: 'client',
      profile: profileData
    };
  },

  async registerPsychologist(
    adminId: string,
    email: string,
    password: string,
    profile: PsychologistProfile
  ) {
    try {
      // 1. Cek email unik di auth.users dan psychologists
      const { data: existingUser } = await supabase
        .from('psychologists')
        .select('id')
        .eq('email', profile.email)
        .maybeSingle();

      if (existingUser) {
        throw new Error('Email sudah terdaftar sebagai psikolog');
      }

      // 2. Create user dengan service role key
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: profile.email,
        password,
        email_confirm: true,
        user_metadata: {
          role: 'psychologist',
          registered_by: adminId
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error('Email sudah terdaftar di sistem');
        }
        throw authError;
      }

      // 3. Insert ke psychologists dengan transaction
      const { error: dbError } = await supabase
        .from('psychologists')
        .insert({
          ...profile,
          id: authData.user.id
        });

      if (dbError) {
        // Rollback: Hapus user jika gagal insert profile
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(`Gagal membuat profil: ${dbError.message}`);
      }

      return {
        id: authData.user.id,
        ...profile
      };

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred');
    }
  },

  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return {
      user: data.user,
      session: data.session,
      error
    };
  },

  refreshToken: async (refreshToken: string) => {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    return {
      session: data.session,
      error
    };
  }
};