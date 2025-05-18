// infrastructure/health/health.service.ts
import { supabase } from '../supabase/auth';
import Redis from 'ioredis';

export class HealthService {
	private redis: Redis;

	constructor() {
		this.redis = new Redis(process.env.REDIS_URL!);
	}

	async checkDatabase(): Promise<boolean> {
		const timeout = 5000; // 5 seconds
		const controller = new AbortController();

		const timeoutId = setTimeout(() => {
			controller.abort();
		}, timeout);

		try {
			const { data, error } = await supabase
				.from('users')
				.select('*')
				.limit(1)
				.abortSignal(controller.signal);

			clearTimeout(timeoutId);
			return !error && data !== null;
		} catch (error) {
			clearTimeout(timeoutId);
			return false;
		}
	}

	async checkRedis(): Promise<boolean> {
		try {
			const result = await Promise.race([
				this.redis.ping(),
				new Promise((_, reject) =>
					setTimeout(() => reject(new Error('Redis timeout')), 5000)
				)
			]);

			return result === 'PONG';
		} catch (error) {
			return false;
		}
	}

	async fullHealthCheck(): Promise<{
		database: boolean;
		redis: boolean;
		details: object;
	}> {
		const [dbStatus, redisStatus] = await Promise.all([
			this.checkDatabase(),
			this.checkRedis(),
		]);

		return {
			database: dbStatus,
			redis: redisStatus,
			details: {
				supabase: {
					host: new URL(process.env.SUPABASE_URL!).hostname,
					status: dbStatus ? 'connected' : 'disconnected',
				},
				redis: {
					host: this.redis.options.host,
					port: this.redis.options.port,
					status: redisStatus ? 'connected' : 'disconnected',
				},
			},
		};
	}

	async close() {
		await this.redis.quit();
	}
}