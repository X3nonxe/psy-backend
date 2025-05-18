import { Router } from 'express';
import { Request, Response } from 'express';
import { HealthController } from '../controllers/health.controller';
import asyncHandler from 'express-async-handler';

const router = Router();
const controller = new HealthController();

router.get('/', asyncHandler(controller.getHealthStatus.bind(controller)));

export default router;
