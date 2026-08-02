import { Router } from 'express';
import { handleRecurrenteWebhook } from '../controllers/webhooks.controller';

const router = Router();

// Endpoint público para recibir webhooks de Recurrente
router.post('/recurrente', handleRecurrenteWebhook);

export default router;
