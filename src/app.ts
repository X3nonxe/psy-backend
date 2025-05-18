// src/app.ts
import express, { ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import promBundle from 'express-prom-bundle';
import healthRouter from './presentation/routes/health.routes';
import authRouter from './presentation/routes/auth.routes';
import consultationRouter from './presentation/routes/consultation.routes';
import adminRoutes from './presentation/routes/admin.routes';
import scheduleRoutes from './presentation/routes/schedule.routes';
import psychologistRoutes from './presentation/routes/psychologist.routes';
import clientRoutes from './presentation/routes/client.routes';
import { Logger } from './infra/logging/logger';
import { errorHandler } from './presentation/middlewares/error.middleware';
import { initializeSocketServer } from './infra/socket/socket.server';

// Load environment variables
config();

// Initialize logger
const logger = new Logger();

const app = express();

const { server, io } = initializeSocketServer(app);

// Prometheus metrics
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  customLabels: { app: 'psych-consultation' },
  promClient: {
    collectDefaultMetrics: {}
  }
});
app.use(metricsMiddleware);

// ======================
// Security Middlewares
// ======================
app.use(helmet());
console.log('CORS origin:', process.env.CLIENT_APP_URL, process.env.ADMIN_APP_URL);
app.use(
  cors({
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later'
  })
);

// ======================
// Request Parsing
// ======================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ======================
// Request Logging
// ======================
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// ======================
// Routes
// ======================
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/consultations', consultationRouter);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/psychologists', psychologistRoutes);
app.use('/api/v1/clients', clientRoutes)
// ======================

app.use(errorHandler as ErrorRequestHandler);

// ======================
// Error Handling
// ======================
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${error.message}`);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack
  });
});

// ======================
// Server Configuration
// ======================
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = () => {
  try {
    server.listen(PORT, () => {
      logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/api/v1/health`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${(error as Error).message}`);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('SIGINT signal received. Closing server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing server...');
  process.exit(0);
});

startServer();

// export { app };
// export default startServer;