import { Request, Response } from 'express';
import { CreateConsultationUseCase } from '../../application/useCases/consultation/createConsultation.useCase';
import { ConsultationRepository } from '../../infra/repositories/consultation.repository';
import { GetConsultationsUseCase } from '../../application/useCases/consultation/getConsultations.useCase';
import { UpdateConsultationUseCase } from '../../application/useCases/consultation/updateConsultation.useCase';
import { CustomRequest } from '../../application/types/express.types'; // Tambahkan ini
import { ConsultationStatus, CreateConsultationDTO } from '../../domain/entities/consultation';

export class ConsultationController {
  private createUseCase = new CreateConsultationUseCase(new ConsultationRepository());
  private getUseCase = new GetConsultationsUseCase(new ConsultationRepository());
  private updateUseCase = new UpdateConsultationUseCase(new ConsultationRepository());

  async getClientConsultations(req: CustomRequest, res: Response) {
    try {
      if (!req.user) throw new Error('Unauthorized');

      const consultations = await this.getUseCase.execute({
        role: 'client',
        user_id: req.user.id  // Pastikan mengirim user_id
      });
      res.json(consultations);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async createConsultation(req: CustomRequest, res: Response) {
    try {
      if (!req.user) throw new Error('Unauthorized');
      
      // Gunakan DTO untuk create operation
      const consultationDTO: CreateConsultationDTO = {
        clientId: req.user.id,
        psychologistId: req.body.psychologist_id,
        scheduledTime: new Date(req.body.scheduled_time),
        duration: req.body.duration,
        status: 'pending' as ConsultationStatus,
        notes: req.body.notes
      };
  
      const consultation = await this.createUseCase.execute(consultationDTO);
      res.status(201).json({
        id: consultation.id,
        client_id: consultation.clientId,
        psychologist_id: consultation.psychologistId,
        scheduled_time: consultation.scheduledTime.toISOString(),
        duration: consultation.duration,
        status: consultation.status,
        notes: consultation.notes
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getPsychologistConsultations(req: CustomRequest, res: Response) {
    try {
      if (!req.user) throw new Error('Unauthorized');

      const consultations = await this.getUseCase.execute({
        user_id: req.user.id,
        role: 'psychologist'
      });
      res.json(consultations);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async updateConsultationStatus(req: CustomRequest, res: Response) {
    try {
      if (!req.user) throw new Error('Unauthorized');

      const consultation = await this.updateUseCase.execute(
        req.params.id,
        { status: req.body.status },
        req.user.id
      );
      res.json(consultation);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getAllConsultations(req: CustomRequest, res: Response) {
    try {
      if (!req.user) throw new Error('Unauthorized');

      const { page = 1, limit = 20 } = req.body;
      const consultations = await this.getUseCase.execute({
        role: 'admin',
        pagination: { page, limit }
      });
      res.json(consultations);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async deleteConsultation(req: CustomRequest, res: Response) {
    try {
      if (!req.user) throw new Error('Unauthorized');

      await new ConsultationRepository().delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}