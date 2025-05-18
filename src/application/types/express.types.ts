import { Request, Response } from 'express';
import { UserRole } from '../../domain/types/user.types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        metadata: any;
      };
    }
  }
}

export type CustomRequest = Request;
export type CustomResponse = Response;