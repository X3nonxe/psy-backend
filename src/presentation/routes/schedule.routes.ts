import { Router } from 'express';
import { ScheduleController } from '../controllers/schedule.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { body, param } from 'express-validator';
import { validateRequest } from '../middlewares/validation.middleware';

const router = Router();
const controller = new ScheduleController();

// Create schedule
router.post(
	'/psychologists/schedules',
	authMiddleware(['psychologist', 'admin']),
	[
		body().isArray().withMessage('Request body harus berupa array'),
		body('*.dayOfWeek').isInt({ min: 1, max: 7 }).withMessage('Hari harus 1-7 (Senin-Minggu)'),
		body('*.startTime').matches(/^([01][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Format waktu mulai invalid (HH:MM)'),
		body('*.endTime').matches(/^([01][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Format waktu selesai invalid (HH:MM)'),
		body('*.isRecurring').optional().isBoolean(),
		body('*.validFrom').optional().isISO8601(),
		body('*.validTo').optional().isISO8601()
	],
	validateRequest,
	controller.createSchedule
);

// Get schedules
router.get(
	'/psychologists/:psychologistId/schedules',
	authMiddleware(['psychologist', 'admin', 'client']), // Client bisa lihat jadwal
	[
		param('psychologistId').isUUID()
	],
	validateRequest,
	controller.getSchedules
);

// Update schedule
router.put(
	'/psychologists/schedules/:id',
	authMiddleware(['psychologist', 'admin']),
	[
		param('id').isUUID(),
		body('dayOfWeek').optional().isInt({ min: 1, max: 7 }),
		body('startTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
		body('endTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
		body('isRecurring').optional().isBoolean(),
		body('validFrom').optional().isISO8601(),
		body('validTo').optional().isISO8601()
	],
	validateRequest,
	controller.updateSchedule
);

// Delete schedule
router.delete(
	'/psychologists/schedules/:id',
	authMiddleware(['psychologist', 'admin']),
	[
		param('id').isUUID()
	],
	validateRequest,
	controller.deleteSchedule
);

export default router;