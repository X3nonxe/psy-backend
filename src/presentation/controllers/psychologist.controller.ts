import { Request, Response } from 'express';
import { PsychologistRepository } from '../../infra/repositories/psychologist.repository';
import { supabase } from '../../infra/supabase/auth';

export class PsychologistController {
	private psyRepo: PsychologistRepository;

	constructor() {
		this.psyRepo = new PsychologistRepository();
		this.getAllPsychologists = this.getAllPsychologists.bind(this);
		this.getPsychologistById = this.getPsychologistById.bind(this);
		this.updatePsychologist = this.updatePsychologist.bind(this);
		this.deletePsychologist = this.deletePsychologist.bind(this);
	}

	async getAllPsychologists(req: Request, res: Response) {
		try {
			const { page = 1, limit = 10 } = req.query;
			const psychologists = await this.psyRepo.findAll(
				Number(page),
				Number(limit)
			);
			res.json(psychologists);
		} catch (error) {
			console.error('Error fetching psychologists:', error);
			res.status(500).json({ error: 'Gagal mengambil data psikolog' });
		}
	}

	async getPsychologistById(req: Request, res: Response) {
		try {
			const psychologist = await this.psyRepo.findById(req.params.id);
			if (!psychologist) {
				res.status(404).json({ error: 'Psikolog tidak ditemukan' });
			}
			res.json(psychologist);
		} catch (error) {
			res.status(500).json({ error: 'Gagal mengambil data psikolog' });
		}
	}

	async updatePsychologist(req: Request, res: Response) {
		try {
			const updatedData = {
				...req.body,
				specializations: Array.isArray(req.body.specializations)
					? req.body.specializations
					: [req.body.specializations],
				consultation_fee: Number(req.body.consultation_fee)
			};

			const psychologist = await this.psyRepo.update(
				req.params.id,
				updatedData
			);
			res.json(psychologist);
		} catch (error) {
			res.status(400).json({ error: (error as Error).message });
		}
	}

	async deletePsychologist(req: Request, res: Response) {
		try {
			// Hapus user auth terlebih dahulu
			const { error: authError } = await supabase.auth.admin.deleteUser(
				req.params.id
			);

			if (authError) throw authError;

			// Hapus data psikolog
			await this.psyRepo.delete(req.params.id);

			res.json({ success: true });
		} catch (error) {
			res.status(500).json({
				error: 'Gagal menghapus psikolog: ' + (error as Error).message
			});
		}
	}
}