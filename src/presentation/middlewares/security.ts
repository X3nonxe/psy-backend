// presentation/middlewares/security.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import express from 'express';

export const securityMiddleware = [
  helmet(),
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP'
  }),
  express.json({ limit: '10kb' })
];