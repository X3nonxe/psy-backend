// infrastructure/repositories/consultation.repository.ts
import { supabase } from '../supabase/auth';
import { Consultation } from '../../domain/entities/consultation';
import { v4 as uuidv4 } from 'uuid';
import { ChatRepository } from './chat.repository';

export class ConsultationRepository {
  private chatRepo = new ChatRepository();
  createBaseQuery() {
    return supabase.from('consultations').select('*');
  }

  async create(consultation: Consultation): Promise<Consultation> {
    // Jika ID belum digenerate
    if (!consultation.id) {
      consultation = new Consultation(
        uuidv4(),
        consultation.clientId,
        consultation.psychologistId,
        consultation.scheduledTime,
        consultation.duration,
        consultation.status,
        consultation.notes
      );
    }

    const { data, error } = await supabase
      .from('consultations')
      .insert({
        id: consultation.id,
        client_id: consultation.clientId,
        psychologist_id: consultation.psychologistId,
        scheduled_time: consultation.scheduledTime,
        duration: consultation.duration,
        status: consultation.status,
        notes: consultation.notes
      })
      .single();

    if (error) throw new Error(error.message);
    return consultation;
  }

  async findById(id: string) {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async update(id: string, updateData: any) {
    const { data, error } = await supabase
      .from('consultations')
      .update(updateData)
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string) {
    const { data, error } = await supabase
      .from('consultations')
      .delete()
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}