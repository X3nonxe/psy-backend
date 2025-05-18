// src/types/express.d.ts
import { UserRole } from '../domain/types/user.types';

declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				email: string;
				role: UserRole;
				metadata: any;
			};
		}
	}

	namespace Express {
		interface Headers {
			authorization?: string;
		}
	}
}