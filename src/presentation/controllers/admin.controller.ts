import { Request, Response } from 'express';
import { supabase } from '../../infra/supabase/auth';

export class AdminController {
  async createAdmin(req: Request, res: Response) {
    try {
      const { email, password, full_name } = req.body;

      // 1. Create admin user
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Skip verification
        user_metadata: {
          role: 'admin',
          full_name
        }
      });

      if (error) throw error;
      
      // 2. Insert to users table
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email,
          role: 'admin',
          full_name
        });

      if (dbError) throw dbError;

      res.status(201).json({
        success: true,
        data: {
          id: data.user.id,
          email: data.user.email,
          role: 'admin'
        }
      });
      
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }
}