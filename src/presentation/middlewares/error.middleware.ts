import { ErrorRequestHandler } from 'express';
import { ValidationError } from '../../application/errors/validation.error';

export const errorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: any[] | undefined;

  if (err instanceof ValidationError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.details;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Invalid authentication credentials';
  }

  const response: any = {
    success: false,
    message,
    errors
  };

  if (!isProduction) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};