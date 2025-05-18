import { supabase } from '../supabase/auth';

export class ChatRepository {
	async validateParticipant(consultationId: string, userId: string) {
		const { data, error } = await supabase
			.from('consultations')
			.select('client_id, psychologist_id')
			.eq('id', consultationId)
			.or(`client_id.eq.${userId},psychologist_id.eq.${userId}`)
			.single();

		return !!data && !error;
	}

	async saveMessage(msg: {
		consultation_id: string;
		sender_id: string;
		content: string;
		type: 'text' | 'image' | 'file';
	}) {
		const { data, error } = await supabase
			.from('chat_messages')
			.insert(msg)
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	async markMessageAsDelivered(messageId: string) {
		await supabase
			.from('chat_messages')
			.update({ read: true })
			.eq('id', messageId);
	}

	async updatePresence(userId: string, status: 'online' | 'offline') {
		await supabase
			.from('active_chats')
			.upsert({
				user_id: userId,
				status,
				last_active: new Date().toISOString()
			});
	}
}