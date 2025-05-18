import { ConsultationRepository } from '../../../infra/repositories/consultation.repository';
import { ConsultationStatus } from '../../../domain/entities/consultation';

export class UpdateConsultationUseCase {
	constructor(private repository: ConsultationRepository) { }

	async execute(
		consultationId: string,
		updateData: { status: ConsultationStatus },
		userId: string
	) {
		// Cek kepemilikan konsultasi
		const existing = await this.repository.findById(consultationId);

		if (!existing) {
			throw new Error('Consultation not found');
		}

		if (
			existing.psychologist_id !== userId &&
			existing.client_id !== userId
		) {
			throw new Error('Unauthorized to update this consultation');
		}

		return this.repository.update(consultationId, updateData);
	}
}