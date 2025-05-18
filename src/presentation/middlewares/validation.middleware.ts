import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../../application/errors/validation.error';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req).formatWith((error) => ({
    field: (error as any).param,
    message: error.msg
  }));
  
  if (!errors.isEmpty()) {
    throw new ValidationError(
      'Validasi gagal',
      errors.array({ onlyFirstError: true })
    );
  }
  
  next();
};