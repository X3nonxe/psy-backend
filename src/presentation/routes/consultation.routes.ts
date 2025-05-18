import { Router } from 'express';
import { ConsultationController } from '../controllers/consultation.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { body, param } from 'express-validator';

const router = Router();
const controller = new ConsultationController();

// Client Routes
router.get(
  '/client',
  authMiddleware(['client']),
  controller.getClientConsultations.bind(controller)
);

router.post(
  '/',
  authMiddleware(['client']),
  [
    body('psychologist_id').isUUID(),
    body('scheduled_time').isISO8601(),
    body('duration').isInt({ min: 30, max: 120 }),
    body('notes').optional().isString()
  ],
  validateRequest,
  controller.createConsultation.bind(controller)
);

// Psychologist Routes
router.get(
  '/psychologist',
  authMiddleware(['psychologist']),
  controller.getPsychologistConsultations.bind(controller)
);

router.put(
  '/:id/status',
  authMiddleware(['psychologist']),
  [
    param('id').isUUID(),
    body('status').isIn(['confirmed', 'cancelled', 'completed'])
  ],
  validateRequest,
  controller.updateConsultationStatus.bind(controller)
);

// Admin Routes
router.get(
  '/admin',
  authMiddleware(['admin']),
  [
    body('page').optional().isInt({ min: 1 }),
    body('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validateRequest,
  controller.getAllConsultations
);

router.delete(
  '/:id',
  authMiddleware(['admin']),
  [
    param('id').isUUID()
  ],
  validateRequest,
  controller.deleteConsultation
);

export default router;