import { supabase } from '../supabase/auth';
import { PsychologistSchedule } from '../../domain/entities/schedule.entity';
import { CACHE_KEYS, TTL } from '../../config/cache';
import { redis } from '../../infra/redis/client';

export class ScheduleRepository {
	async create(schedule: Omit<PsychologistSchedule, 'id'>): Promise<PsychologistSchedule> {
		const { data, error } = await supabase
			.from('psychologist_schedules')
			.insert(schedule)
			.select('*')
			.single();

		if (error) throw new Error(error.message);
		await redis.del(CACHE_KEYS.SCHEDULES(schedule.psychologist_id));
		return data as PsychologistSchedule;
	}

	async getByPsychologist(psychologistId: string): Promise<PsychologistSchedule[]> {
		// const cacheKey = CACHE_KEYS.SCHEDULES(psychologistId);

		// const cached = await redis.get(cacheKey);
		// if (cached) return JSON.parse(cached);

		const { data, error } = await supabase
			.from('psychologist_schedules')
			.select('*')
			.eq('psychologist_id', psychologistId);

		if (error) throw new Error(error.message);
		// await redis.setEx(cacheKey, TTL.SCHEDULES, JSON.stringify(data as PsychologistSchedule[]));
		return data as PsychologistSchedule[];
	}

	async findById(scheduleId: string): Promise<PsychologistSchedule | null> {
		const { data, error } = await supabase
			.from('psychologist_schedules')
			.select('*')
			.eq('id', scheduleId)
			.single();

		if (error) return null;
		return data as PsychologistSchedule;
	}

	async update(scheduleId: string, updateData: Partial<PsychologistSchedule>) {
		// Get the schedule first to know which psychologist_id it belongs to
		const schedule = await this.findById(scheduleId);
		if (!schedule) throw new Error('Schedule not found');

		const { data, error } = await supabase
			.from('psychologist_schedules')
			.update(updateData)
			.eq('id', scheduleId)
			.single();

		if (error) throw new Error(error.message);

		// Invalidate cache for this psychologist's schedules
		await redis.del(CACHE_KEYS.SCHEDULES(schedule.psychologist_id));

		return data;
	}

	async delete(scheduleId: string) {
		// Get the schedule first to know which psychologist_id it belongs to
		const schedule = await this.findById(scheduleId);
		if (!schedule) throw new Error('Schedule not found');

		const { error } = await supabase
			.from('psychologist_schedules')
			.delete()
			.eq('id', scheduleId);

		if (error) throw new Error(error.message);

		// Invalidate cache for this psychologist's schedules
		await redis.del(CACHE_KEYS.SCHEDULES(schedule.psychologist_id));
	}
}