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
        // Eventos de suscripción de Recurrente
        if (event_type && event_type.startsWith('subscription.')) {
            const subscriptionId = req.body.checkout?.metadata?.subscriptionId || req.body.subscription?.metadata?.subscriptionId;
            const tenantId = req.body.checkout?.metadata?.tenantId || req.body.subscription?.metadata?.tenantId;
            const providerEventId = req.body.id || 'TODO_EVENT_ID';
            if (subscriptionId) {
                try {
                    await prisma_1.prisma.subscriptionEvent.create({
                        data: {
                            subscriptionId,
                            tenantId,
                            provider: 'RECURRENTE',
                            eventType: event_type,
                            providerEventId,
                            payload: req.body,
                            processedAt: new Date(),
                        }
                    });
                    if (event_type === 'subscription.payment_succeeded' || event_type === 'subscription.activated') {
                        await prisma_1.prisma.subscription.update({
                            where: { id: subscriptionId },
                            data: {
                                status: 'ACTIVE',
                                startedAt: new Date()
                            }
                        });
                        if (tenantId) {
                            await prisma_1.prisma.tenant.update({
                                where: { id: tenantId },
                                data: { status: 'ACTIVE' }
                            });
                        }
                        console.log(`Subscription ${subscriptionId} and Tenant ${tenantId} activated.`);
                    }
                    else if (event_type === 'subscription.payment_failed') {
                        await prisma_1.prisma.subscription.update({
                            where: { id: subscriptionId },
                            data: { status: 'PAST_DUE' }
                        });
                    }
                    else if (event_type === 'subscription.cancelled') {
                        await prisma_1.prisma.subscription.update({
                            where: { id: subscriptionId },
                            data: {
                                status: 'CANCELLED',
                                cancelledAt: new Date()
                            }
                        });
                        if (tenantId) {
                            await prisma_1.prisma.tenant.update({
                                where: { id: tenantId },
                                data: { status: 'SUSPENDED' }
                            });
                        }
                    }
                    else if (event_type === 'subscription.expired') {
                        await prisma_1.prisma.subscription.update({
                            where: { id: subscriptionId },
                            data: { status: 'EXPIRED' }
                        });
                        if (tenantId) {
                            await prisma_1.prisma.tenant.update({
                                where: { id: tenantId },
                                data: { status: 'SUSPENDED' }
                            });
                        }
                    }
                }
                catch (e) {
                    if (e.code === 'P2002') {
                        console.log(`Webhook event ${providerEventId} ya fue procesado.`);
                    }
                    else {
                        throw e;
                    }
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
