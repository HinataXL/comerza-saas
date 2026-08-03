"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRecurrenteWebhook = void 0;
const prisma_1 = require("../lib/prisma");
const handleRecurrenteWebhook = async (req, res) => {
    try {
        const { event_type, data } = req.body;
        console.log("=== WEBHOOK RECIBIDO ===");
        console.log(JSON.stringify(req.body, null, 2));
        // Recurrente Webhook sends event_type
        if (event_type === 'payment_intent.succeeded' || event_type === 'cash_intent.succeeded') {
            // El external_id viene dentro de checkout.metadata en la versión actual de Recurrente
            const externalId = req.body.checkout?.metadata?.external_id;
            if (externalId) {
                // Encontramos la venta pendiente
                const sale = await prisma_1.prisma.sale.findUnique({ where: { id: externalId } });
                if (sale && sale.status === 'PENDING') {
                    // Marcar como completada
                    await prisma_1.prisma.sale.update({
                        where: { id: externalId },
                        data: { status: 'COMPLETED' }
                    });
                    console.log(`Sale ${externalId} marked as COMPLETED via Recurrente webhook.`);
                }
            }
        }
        // Siempre respondemos 200 OK para que Recurrente sepa que recibimos el webhook
        res.status(200).send('Webhook received');
    }
    catch (error) {
        console.error('Error handling Recurrente webhook:', error);
        res.status(500).send('Webhook error');
    }
};
exports.handleRecurrenteWebhook = handleRecurrenteWebhook;
