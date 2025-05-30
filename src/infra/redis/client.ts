// src/infrastructure/redis/client.ts
import { createClient } from 'redis';
const { Logger } = require('../logging/logger');
import dotenv from 'dotenv';

dotenv.config();
const logger = new Logger();

// Init Redis
const redis = createClient({
  url: process.env.REDIS_URL,
});
(async () => {
  try {
    await redis.connect();
    logger.info('Connected to Redis');
  } catch (error) {
    logger.error(`Failed to connect to Redis: ${(error as Error).message}`);
    process.exit(1);
  }
})();

export { redis };