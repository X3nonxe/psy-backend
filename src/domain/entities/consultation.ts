export type ConsultationStatus = 
  'pending' | 'confirmed' | 'completed' | 'cancelled';

export class Consultation {
  constructor(
    public id: string,
    public clientId: string,
    public psychologistId: string,
    public scheduledTime: Date,
    public duration: number,
    public status: ConsultationStatus,
    public notes?: string
  ) {}
}

// Tambahkan DTO untuk create operation
export type CreateConsultationDTO = Omit<Consultation, 'id'>;