import { Router } from 'express';
import { body } from 'express-validator';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();
const controller = new AdminController();

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});

router.post(
  '/create-admin',
	adminLimiter,
  authMiddleware(['admin']), // Hanya admin yang ada bisa akses
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('full_name').notEmpty().trim()
  ],
  validateRequest,
  controller.createAdmin
);

export default router;