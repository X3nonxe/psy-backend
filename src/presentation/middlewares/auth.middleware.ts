import { Request, Response, NextFunction, RequestHandler } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { CustomRequest } from '../../application/types/express.types';

dotenv.config();

const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_KEY!
);

export const authMiddleware = (roles: string[]) => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) throw new Error('Missing token');

      // Gunakan API khusus untuk verifikasi token
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) throw new Error('Invalid token');
      if (!roles.includes(user.user_metadata?.role)) throw new Error('Unauthorized');

      req.user = {
        id: user.id,
        email: user.email!,
        role: user.user_metadata?.role,
        metadata: user.user_metadata
      };

      next();
    } catch (err) {
      res.status(401).json({ 
        success: false,
        error: (err as Error).message
      });
    }
  };
};
