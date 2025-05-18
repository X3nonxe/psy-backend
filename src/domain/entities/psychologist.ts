export type Psychologist = {
  id: string;
  email: string;
  full_name: string;
  specializations: string[];
  license_number: string;
  is_available: boolean;
  description?: string;
  education: Array<{
    degree: string;
    university: string;
  }>;
  consultation_fee: number;
};