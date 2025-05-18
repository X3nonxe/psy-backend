import { RequestHandler } from 'express';
import { HealthService } from '../../infra/health/health.service';

export class HealthController {
  private healthService = new HealthService();

  getHealthStatus: RequestHandler = async (req, res) => {
    try {
      const healthStatus = await this.healthService.fullHealthCheck();
      
      if (!healthStatus.database || !healthStatus.redis) {
        res.status(500).json({
          status: 'error',
          services: {
            database: healthStatus.database ? 'connected' : 'connection failed',
            redis: healthStatus.redis ? 'connected' : 'connection failed',
          },
          details: healthStatus.details,
        });
        return;
      }

      res.json({
        status: 'ok',
        services: {
          database: 'connected',
          redis: 'connected',
        },
        details: healthStatus.details,
      });
    } catch (error) {
      res.status(503).json({
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      this.healthService.close().catch((err) => {
        console.error('Error closing health service:', err);
      });
    }
  }
}
