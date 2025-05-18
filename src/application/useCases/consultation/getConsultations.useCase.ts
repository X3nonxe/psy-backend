import { ConsultationRepository } from '../../../infra/repositories/consultation.repository';
import { UserRole } from '../../../domain/types/user.types';
import { Consultation } from '../../../domain/entities/consultation';

type GetConsultationsParams = {
  role: UserRole;
  user_id?: string;
  pagination?: {
    page: number;
    limit: number;
  };
};

export class GetConsultationsUseCase {
	constructor(private repository: ConsultationRepository) { }

	async execute(params: GetConsultationsParams) {
		const baseQuery = this.repository.createBaseQuery();

    if (params.role === 'client' && params.user_id) {
      baseQuery.eq('client_id', params.user_id);
    } else if (params.role === 'psychologist' && params.user_id) {
      baseQuery.eq('psychologist_id', params.user_id);
    }

		if (params.pagination) {
			const offset = (params.pagination.page - 1) * params.pagination.limit;
			baseQuery.range(offset, offset + params.pagination.limit - 1);
		}

		const { data, error } = await baseQuery;

		if (error) throw new Error('Failed to fetch consultations');
		return data.map((dbData: any) => 
			new Consultation(
				dbData.id,
				dbData.client_id,
				dbData.psychologist_id,
				new Date(dbData.scheduled_time),
				dbData.duration,
				dbData.status,
				dbData.notes
			)
		);
	}
}