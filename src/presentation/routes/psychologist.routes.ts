import { Router } from 'express';
import { PsychologistController } from '../controllers/psychologist.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { body } from 'express-validator';
import asyncHandler from 'express-async-handler';

const router = Router();
const controller = new PsychologistController();

// Middleware admin khusus
const adminMiddleware = authMiddleware(['admin']);

router.get(
	'/',
	// adminMiddleware,
	asyncHandler(controller.getAllPsychologists)
);

router.get(
	'/:id',
	// adminMiddleware,
	asyncHandler(controller.getPsychologistById)
);

router.put(
	'/:id',
	adminMiddleware,
	[
		body('full_name').optional().trim(),
		body('specializations')
			.optional()
			.isArray().withMessage('Spesialisasi harus berupa array'),
		body('consultation_fee')
			.optional()
			.isFloat({ min: 0 }).withMessage('Biaya harus angka positif'),
		body('available').optional().isBoolean(),
		body('education')
			.optional()
			.isArray().withMessage('Pendidikan harus berupa array'),
	],
	validateRequest,
	asyncHandler(controller.updatePsychologist)
);

router.delete(
	'/:id',
	adminMiddleware,
	asyncHandler(controller.deletePsychologist)
);

export default router;