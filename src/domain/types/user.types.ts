import { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'client' | 'psychologist' | 'admin';

export type AuthUser = {
	id: string;
	email: string;
	role: 'client' | 'psychologist' | 'admin';
	profile?: ClientProfile | PsychologistProfile;
};

export type ClientProfile = {
	full_name: string;
	phone_number: string;
	date_of_birth: Date;
};

export type EducationEntry = {
	degree: string;
	university: string;
};

export type PsychologistProfile = {
	email: string;
	full_name: string;
	specializations: string[];
	license_number: string;
	available: boolean;
	description?: string;
	education: EducationEntry[];
	consultation_fee: number;
};

// Type guard untuk Supabase user
export const isAuthUser = (user: SupabaseUser | null): user is SupabaseUser => {
	return !!user?.id && !!user.email;
};