import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { body } from 'express-validator';
import { authMiddleware } from '../middlewares/auth.middleware';
import asyncHandler from 'express-async-handler';

const router = Router();
const controller = new AuthController();

// Client Registration
router.post(
  '/register/client',
  [
    body('email')
      .isEmail().withMessage('Format email tidak valid')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 }).withMessage('Password minimal 8 karakter'),
    body('full_name')
      .notEmpty().withMessage('Nama lengkap wajib diisi')
      .trim(),
    body('phone_number')
      .isMobilePhone('id-ID').withMessage('Nomor HP Indonesia tidak valid')
      .customSanitizer(value => value.replace(/^0/, '+62')),
    body('date_of_birth')
      .isDate({ format: 'DD-MM-YYYY' }).withMessage('Format tanggal harus DD-MM-YYYY')
      .toDate()
  ],
  validateRequest,
  controller.registerClient
); 

// Psychologist Registration (Hanya Admin)
router.post(
  '/register/psychologist',
  authMiddleware(['admin']),
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('full_name').notEmpty().trim(),
    body('specializations').isArray({ min: 1 }),
    body('license_number').notEmpty(),
    body('description').optional().isString().isLength({ max: 500 }),
    body('address').optional().isString().isLength({ max: 500 }),
    body('consultation_fee').isFloat({ min: 0 }),
    body('education').isArray({ min: 1 }),
    body('education.*.degree').notEmpty(),
    body('education.*.university').notEmpty(),
  ],
  validateRequest,
  asyncHandler(controller.registerPsychologist)
);

// Login Umum
router.post(
  '/login',
  [
    body('email').exists().isEmail().normalizeEmail(),
    body('password').exists().isString().notEmpty()
  ],
  validateRequest,
  asyncHandler(controller.login)
);

// Refresh Token
router.post(
  '/refresh-token',
  [
    body('refresh_token').isJWT()
  ],
  validateRequest,
  controller.refreshToken
);

export default router;