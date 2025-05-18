import { Request, Response } from 'express';
import { ScheduleRepository } from '../../infra/repositories/schedule.repository';
import { PsychologistRepository } from '../../infra/repositories/psychologist.repository';
import { PsychologistSchedule } from 'domain/entities/schedule.entity';
import { redis } from 'infra/redis/client';
import { CACHE_KEYS } from 'config/cache';

export class ScheduleController {
	private scheduleRepo: ScheduleRepository;
	private psyRepo: PsychologistRepository;

	constructor() {
		this.scheduleRepo = new ScheduleRepository();
		this.psyRepo = new PsychologistRepository();

		this.createSchedule = this.createSchedule.bind(this);
		this.getSchedules = this.getSchedules.bind(this);
		this.updateSchedule = this.updateSchedule.bind(this);
		this.deleteSchedule = this.deleteSchedule.bind(this);
	}

	/**
	 * Membuat jadwal baru untuk psikolog
	 */
	async createSchedule(req: Request, res: Response) {
		try {
			if (!req.user) {
				res.status(401).json({
					success: false,
					error: 'Unauthorized: User not authenticated'
				});
			}

			const psychologistId = req.user!.id;
			const schedules = req.body.map((s: any) => ({
				psychologist_id: psychologistId,
				day_of_week: s.dayOfWeek,
				start_time: s.startTime,
				end_time: s.endTime,
				is_recurring: s.isRecurring,
				valid_from: s.validFrom,
				valid_to: s.validTo
			}));

			// Validasi psikolog exists
			const psychologist = await this.psyRepo.findById(psychologistId);
			if (!psychologist) {
				res.status(404).json({
					success: false,
					error: 'Psychologist not found'
				});
			}

			// Insert semua jadwal
			const createdSchedules = [];
			for (const schedule of schedules) {
				const newSchedule = await this.scheduleRepo.create(schedule);
				createdSchedules.push({
					id: newSchedule.id,
					dayOfWeek: newSchedule.day_of_week,
					startTime: newSchedule.start_time,
					endTime: newSchedule.end_time,
					isRecurring: newSchedule.is_recurring,
					validFrom: newSchedule.valid_from,
					validTo: newSchedule.valid_to
				});
			}

			res.status(201).json({
				success: true,
				data: createdSchedules
			});
		} catch (error) {
			res.status(400).json({
				success: false,
				error: (error as Error).message
			});
		}
	}

	/**
	 * Mendapatkan semua jadwal psikolog
	 */
	async getSchedules(req: Request, res: Response) {
		try {
			const psychologistId = req.params.psychologistId || req.user!.id;
			const schedules = await this.scheduleRepo.getByPsychologist(psychologistId);

			res.json({
				success: true,
				data: schedules
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				error: (error as Error).message
			});
		}
	}

	/**
	 * Update jadwal
	 */
	async updateSchedule(req: Request, res: Response) {
		try {
			const scheduleId = req.params.id;
			const psychologistId = req.user!.id;

			// Validasi kepemilikan jadwal
			const existingSchedule = await this.scheduleRepo.findById(scheduleId);
			if (!existingSchedule || existingSchedule.psychologist_id !== psychologistId) {
				res.status(403).json({
					success: false,
					error: 'Unauthorized to update this schedule'
				});
			}

			const updatedData: Partial<PsychologistSchedule> = {
				day_of_week: req.body.dayOfWeek,
				start_time: req.body.startTime,
				end_time: req.body.endTime,
				is_recurring: req.body.isRecurring,
				valid_from: req.body.validFrom,
				valid_to: req.body.validTo
			};

			const updatedSchedule = await this.scheduleRepo.update(scheduleId, updatedData);

			res.json({
				success: true,
				data: updatedSchedule
			});
		} catch (error) {
			res.status(400).json({
				success: false,
				error: (error as Error).message
			});
		}
	}

	/**
	 * Hapus jadwal
	 */
	async deleteSchedule(req: Request, res: Response) {
		try {
			const scheduleId = req.params.id;
			const psychologistId = req.user!.id;

			const existingSchedule = await this.scheduleRepo.findById(scheduleId);

			if (existingSchedule?.psychologist_id !== psychologistId) {
				res.status(403).json({
					success: false,
					error: 'Unauthorized to delete this schedule'
				});
			}

			await this.scheduleRepo.delete(scheduleId);
			res.status(204).send();
		} catch (error) {
			console.error('Error deleting schedule:', error);
			res.status(500).json({
				success: false,
				error: 'Internal server error'
			});
		}
	}
}