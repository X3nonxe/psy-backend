import { Server, Socket } from 'socket.io';
import { supabase } from '../../infra/supabase/auth';
import { redis } from '../../infra/redis/client';
import { CACHE_KEYS, TTL } from '../../config/cache';
import { Logger } from '../../infra/logging/logger';

const logger = new Logger();

export const registerSocketEvents = (io: Server) => {
	io.on('connection', async (socket) => {
		const userId = socket.data.user.id;
		logger.info(`User connected: ${userId}`);

		// Update status online
		await redis.setex(`presence:${userId}`, TTL.CLIENT, JSON.stringify({
			status: 'online',
			lastActive: new Date()
		}));

		// Event: Join Room
		socket.on('join_room', async (consultationId: string) => {
			try {
				const { data: consultation, error } = await supabase
					.from('consultations')
					.select('client_id, psychologist_id')
					.eq('id', consultationId)
					.single();

				if (error) throw error;
				if (![consultation.client_id, consultation.psychologist_id].includes(userId)) {
					throw new Error('Unauthorized to join this room');
				}

				socket.join(consultationId);
				logger.info(`User ${userId} joined room ${consultationId}`);
			} catch (err) {
				socket.emit('error', { message: (err as Error).message });
			}
		});

		// Event: Kirim Pesan
		socket.on('send_message', async (message: { consultationId: string; content: string }) => {
			const { consultationId, content } = message;
			const senderId = socket.data.user.id;

			// Simpan ke Supabase
			const { error } = await supabase.from('chat_messages').insert({
				consultation_id: consultationId,
				sender_id: senderId,
				content,
			});

			if (error) throw error;

			// Simpan ke Redis
			await redis.rpush(`chat:${consultationId}`, JSON.stringify({
				content,
				sender_id: senderId,
				timestamp: new Date(),
			}));
			await redis.ltrim(`chat:${consultationId}`, -100, -1);

			// Broadcast
			io.to(consultationId).emit('receive_message', {
				content,
				sender_id: senderId,
				timestamp: new Date(),
			});
		});

		// Event: Disconnect
		socket.on('disconnect', async () => {
			await redis.setex(`presence:${userId}`, TTL.CLIENT, JSON.stringify({
				status: 'offline',
				lastActive: new Date()
			}));
			logger.info(`User disconnected: ${userId}`);
		});
	});
};