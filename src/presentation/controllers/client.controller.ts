import { Request, Response } from 'express';
import { ClientRepository } from '../../infra/repositories/client.repository';

export class ClientController {
	private clientRepo: ClientRepository;

	constructor() {
		this.clientRepo = new ClientRepository();
		this.getClientById = this.getClientById.bind(this);
		this.updateClient = this.updateClient.bind(this);
	}

	async getClientById(req: Request, res: Response) {
		try {
			const client = await this.clientRepo.findById(req.params.id);
			if (!client) {
				res.status(404).json({ error: 'Client tidak ditemukan' });
			}
			res.json(client);
		} catch (error) {
			res.status(500).json({ error: 'Gagal mengambil data client' });
		}
	}

	async updateClient(req: Request, res: Response) {
		try {
			const updatedData = {
				...req.body,
			};

			const client = await this.clientRepo.update(
				req.params.id,
				updatedData
			);
			res.json(client);
		} catch (error) {
			res.status(400).json({ error: (error as Error).message });
		}
	}
}