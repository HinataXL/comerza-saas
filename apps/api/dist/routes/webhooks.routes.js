"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhooks_controller_1 = require("../controllers/webhooks.controller");
const router = (0, express_1.Router)();
// Endpoint público para recibir webhooks de Recurrente
router.post('/recurrente', webhooks_controller_1.handleRecurrenteWebhook);
exports.default = router;
