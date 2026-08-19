"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhooks_controller_1 = require("../controllers/webhooks.controller");
const webhook_controller_1 = require("../controllers/webhook.controller");
const router = (0, express_1.Router)();
// Endpoint público para recibir webhooks de Recurrente
router.post('/recurrente', webhooks_controller_1.handleRecurrenteWebhook);
// Endpoints públicos para webhooks de WhatsApp (Meta Cloud API)
router.get('/whatsapp', webhook_controller_1.verifyWhatsAppWebhook);
router.post('/whatsapp', webhook_controller_1.handleWhatsAppWebhook);
exports.default = router;
