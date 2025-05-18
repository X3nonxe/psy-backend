import { supabase } from '../supabase/auth';
import { Client } from '../../domain/entities/client';

export class ClientRepository {
	async create(clientData: Omit<Client, 'created_at'>): Promise<Client> {
		const { data, error } = await supabase
			.from('clients')
			.insert(clientData)
			.single();

		if (error) throw new Error(`Client creation failed: ${error.message}`);
		return data as Client;
	}

	async findById(id: string): Promise<Client | null> {
		const { data, error } = await supabase
			.from('clients')
			.select('*')
			.eq('id', id)
			.single();

		if (error) return null;
		return data as Client;
	}

	async update(id: string, updateData: Partial<Client>): Promise<Client> {
		const { data, error } = await supabase
			.from('clients')
			.update(updateData)
			.eq('id', id)
			.single();

		if (error) throw new Error(`Client update failed: ${error.message}`);
		return data as Client;
	}
}