// src/config/cache.ts
export const CACHE_KEYS = {
	PSYCHOLOGIST: {
		BY_ID: (id: string) => `psychologist:id:${id}`,
		BY_EMAIL: (email: string) => `psychologist:email:${email}`
	},
	SCHEDULES: (psyId: string) => `schedules:${psyId}`,
	CONSULTATIONS: {
		BY_CLIENT: (clientId: string) => `consultations:client:${clientId}`,
		BY_PSYCHOLOGIST: (psyId: string) => `consultations:psy:${psyId}`
	},
	CLIENT: (clientId: string) => `client:${clientId}`
};

export const TTL = {
	PSYCHOLOGIST: 1800,    // 30 menit
	SCHEDULES: 3600,       // 1 jam
	CONSULTATIONS: 900,    // 15 menit
	CLIENT: 1200           // 20 menit
};