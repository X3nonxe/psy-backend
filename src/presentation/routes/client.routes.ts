import { Router } from 'express';
import { ClientController } from '../controllers/client.controller';

const router = Router();
const controller = new ClientController();


// Client Routes
router.get(
	'/:id',
	controller.getClientById.bind(controller)
);

router.put(
	'/:id',
	controller.updateClient.bind(controller)
);

export default router;