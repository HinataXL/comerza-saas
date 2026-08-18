import { Router } from 'express';
import { handleRecurrenteWebhook } from '../controllers/webhooks.controller';
import { handleWhatsAppWebhook, verifyWhatsAppWebhook } from '../controllers/webhook.controller';

const router = Router();

// Endpoint público para recibir webhooks de Recurrente
router.post('/recurrente', handleRecurrenteWebhook);

// Endpoints públicos para webhooks de WhatsApp (Meta Cloud API)
router.get('/whatsapp', verifyWhatsAppWebhook);
router.post('/whatsapp', handleWhatsAppWebhook);

export default router;
