// application/useCases/consultation/createConsultation.useCase.ts
import { ConsultationRepository } from '../../../infra/repositories/consultation.repository';
import { Consultation, CreateConsultationDTO } from '../../../domain/entities/consultation';
import { v4 as uuidv4 } from 'uuid';

export class CreateConsultationUseCase {
  constructor(private readonly repository: ConsultationRepository) {}
  
  async execute(dto: CreateConsultationDTO): Promise<Consultation> {
    const consultation = new Consultation(
      uuidv4(),
      dto.clientId,
      dto.psychologistId,
      dto.scheduledTime,
      dto.duration,
      dto.status,
      dto.notes
    );
    
    return this.repository.create(consultation);
  }
}
