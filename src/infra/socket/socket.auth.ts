import { Socket } from 'socket.io';
import { supabase } from '../../infra/supabase/auth';

export const authenticateSocket = async (socket: Socket, next: (err?: Error) => void) => {
	try {
		const token = socket.handshake.auth.token as string;
		if (!token) return next(new Error('Missing token'));

		const { data: { user }, error } = await supabase.auth.getUser(token);
		if (error || !user) return next(new Error('Invalid token'));

		const userRole = user.user_metadata?.role;
		if (!['client', 'psychologist', 'admin'].includes(userRole)) {
			return next(new Error('Unauthorized role'));
		}

		socket.data.user = {
			id: user.id,
			email: user.email!,
			role: userRole,
			metadata: user.user_metadata
		};

		next();
	} catch (err) {
		next(new Error('Authentication failed'));
	}
};