import { Request, Response } from 'express';
import { authService, supabase } from '../../infra/supabase/auth';
import { AuthUser, ClientProfile, PsychologistProfile } from '../../domain/types/user.types';

export class AuthController {
  async registerClient(req: Request, res: Response) {
    try {
      const { email, password, full_name, phone_number, date_of_birth } = req.body;

      const clientProfile: ClientProfile = {
        full_name,
        phone_number,
        date_of_birth: new Date(date_of_birth)
      };

      const authUser = await authService.registerClient(email, password, clientProfile);

      res.status(201).json({
        success: true,
        data: authUser
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  async registerPsychologist(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Forbidden'
        });
        return;
      }

      const {
        email,
        password,
        full_name,
        specializations,
        license_number,
        consultation_fee,
        description,
        education,
        address
       } = req.body;

      const psyProfile = {
        email,
        full_name,
        specializations: Array.isArray(specializations) ? specializations : [specializations],
        license_number,
        available: false,
        description: description || null,
        address: address || null,
        education: education.map((edu: any) => ({
          degree: edu.degree,
          university: edu.university,
        })),
        consultation_fee: Number(consultation_fee)
      };

      const authUser = await authService.registerPsychologist(
        req.user.id,
        email,
        password,
        psyProfile
      );

      res.status(201).json({
        success: true,
        data: {
          ...authUser,
          education: psyProfile.education,
          spesializations: psyProfile.specializations
        }
      });
    } catch (error) {
      const errorMessage = (error as Error).message.includes('already registered')
        ? 'Email sudah terdaftar'
        : (error as Error).message;

      res.status(400).json({
        success: false,
        error: errorMessage
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // 1. Authentikasi user
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // 2. Dapatkan role dari metadata
      const role = data.user?.user_metadata?.role;

      // 3. Handle berdasarkan role
      switch (role) {
        case 'admin':
          // Admin tidak perlu profil terpisah
          res.json({
            access_token: data.session?.access_token,
            refresh_token: data.session?.refresh_token,
            user: {
              id: data.user.id,
              email: data.user.email,
              role: 'admin'
            }
          });

        case 'client':
          // Cek profil client
          const { data: clientProfile } = await supabase
            .from('clients')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (!clientProfile) throw new Error('Client profile not found');
          break;

        case 'psychologist':
          // Cek profil psychologist
          const { data: psyProfile } = await supabase
            .from('psychologists')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (!psyProfile) throw new Error('Psychologist profile not found');
          break;

        default:
          throw new Error('Invalid user role');
      }

      // 4. Response sukses
      res.json({
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          role
        }
      });

    } catch (error) {
      res.status(401).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refresh_token } = req.body;
      const { session, error } = await authService.refreshToken(refresh_token);

      if (error || !session) {
        throw new Error('Invalid refresh token');
      }

      res.json({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in
      });
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  }
}