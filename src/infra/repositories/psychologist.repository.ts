import { supabase } from '../supabase/auth';
import { Psychologist } from '../../domain/entities/psychologist';
import { CACHE_KEYS, TTL } from '../../config/cache';
import { redis } from '../redis/client';

export class PsychologistRepository {
	async create(psyData: Omit<Psychologist, 'rating'>): Promise<Psychologist> {
		const { data, error } = await supabase
			.from('psychologists')
			.insert({ ...psyData, available: false })
			.single();

		if (error) throw new Error(`Psychologist creation failed: ${error.message}`);
		return data as Psychologist;
	}

	async findAvailable(): Promise<Psychologist[]> {
		const { data, error } = await supabase
			.from('psychologists')
			.select('*')
			.eq('available', true);

		if (error) throw new Error(error.message);
		return data as Psychologist[];
	}

	async updateAvailability(id: string, available: boolean): Promise<Psychologist> {
		const { data, error } = await supabase
			.from('psychologists')
			.update({ available })
			.eq('id', id)
			.single();

		if (error) throw new Error(`Availability update failed: ${error.message}`);
		return data as Psychologist;
	}

	async findById(id: string): Promise<Psychologist | null> {
		const cacheKey = CACHE_KEYS.PSYCHOLOGIST.BY_ID(id);
		// Cek cache
		const cached = await redis.get(cacheKey);
		if (cached) return JSON.parse(cached);

		try {
			const { data, error } = await supabase
				.from('psychologists')
				.select('*')
				.eq('id', id)
				.maybeSingle(); // Gunakan maybeSingle alih-alih single

			if (error) throw error;
			// Simpan ke cache
			await redis.setEx(cacheKey, TTL.PSYCHOLOGIST, JSON.stringify(data as Psychologist));
			return data as Psychologist | null;
		} catch (error) {
			console.error('[REPO_ERROR] findById:', error);
			return null;
		}
	}

	async findByEmail(email: string) {
		const cacheKey = CACHE_KEYS.PSYCHOLOGIST.BY_EMAIL(email);

		const cached = await redis.get(cacheKey);
		if (cached) return JSON.parse(cached);

		const { data, error } = await supabase
			.from('psychologists')
			.select('*')
			.eq('email', email)
			.single();

		if (error || !data) return null;

		// Update kedua cache
		await redis.multi()
			.setEx(cacheKey, TTL.PSYCHOLOGIST, JSON.stringify(data))
			.setEx(CACHE_KEYS.PSYCHOLOGIST.BY_ID(data.id), TTL.PSYCHOLOGIST, JSON.stringify(data))
			.exec();

		return data;
	}

	async update(id: string, data: Partial<Psychologist>) {
		const { data: updatedData, error } = await supabase
			.from('psychologists')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Psychologist update failed: ${error.message}`);
		return updatedData as Psychologist;
	}

	async delete(id: string) {
		const { error } = await supabase
			.from('psychologists')
			.delete()
			.eq('id', id);
		if (error) throw new Error(`Psychologist deletion failed: ${error.message}`);
		// Hapus cache
		await redis.del([
			CACHE_KEYS.PSYCHOLOGIST.BY_ID(id),
			CACHE_KEYS.PSYCHOLOGIST.BY_EMAIL(id)
		]);
	}

	async findAll(page: number, limit: number) {
		try {
			const from = (page - 1) * limit;
			const to = from + limit - 1;

			const { data, error, count } = await supabase
				.from('psychologists')
				.select('*', { count: 'exact' }) // <--- Tambahkan count
				.range(from, to)

			if (error) {
				console.error('Supabase Error:', error); // <--- Log error detail
				throw new Error(error.message);
			}

			return {
				data,
				meta: {
					total: count || 0,
					page,
					limit,
					totalPages: Math.ceil((count || 0) / limit)
				}
			};
		} catch (error) {
			console.error('Repository Error:', error); // <--- Log stack trace
			throw new Error('Gagal mengambil data dari database');
		}
	}

	async invalidateCache(id: string, email: string) {
		await redis.del([
			CACHE_KEYS.PSYCHOLOGIST.BY_ID(id),
			CACHE_KEYS.PSYCHOLOGIST.BY_EMAIL(email)
		]);
	}
}