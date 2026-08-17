"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurrenteSubscriptionGateway = void 0;
class RecurrenteSubscriptionGateway {
    async createSubscriptionCheckout(request) {
        const RECURRENTE_API_BASE_URL = process.env.RECURRENTE_API_BASE_URL || 'https://app.recurrente.com/api';
        const RECURRENTE_API_KEY = process.env.RECURRENTE_API_KEY;
        const RECURRENTE_SECRET_KEY = process.env.RECURRENTE_SECRET_KEY;
        if (!RECURRENTE_API_KEY || !RECURRENTE_SECRET_KEY) {
            console.warn("RECURRENTE_API_KEY o RECURRENTE_SECRET_KEY no configurados. Esto fallará en producción.");
        }
        try {
            // TODO: Reemplazar el endpoint con el real para crear subscripciones en Recurrente
            // Si usan /checkouts, o /subscriptions.
            const RECURRENTE_CREATE_SUBSCRIPTION_ENDPOINT = '/checkouts'; // Placeholder temporal
            const response = await fetch(`${RECURRENTE_API_BASE_URL}${RECURRENTE_CREATE_SUBSCRIPTION_ENDPOINT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-PUBLIC-KEY': RECURRENTE_API_KEY || '',
                    'X-SECRET-KEY': RECURRENTE_SECRET_KEY || ''
                },
                body: JSON.stringify({
                    // TODO: Adaptar payload real de Recurrente
                    items: [
                        {
                            price_id: request.gatewayPlanId,
                            quantity: 1
                        }
                    ],
                    customer: {
                        email: request.email,
                        full_name: request.responsibleName,
                        phone: request.phone
                    },
                    success_url: request.successUrl,
                    cancel_url: request.cancelUrl,
                    metadata: request.metadata
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error from Recurrente API:", errorText);
                throw new Error("Failed to create Recurrente checkout");
            }
            const data = await response.json();
            return {
                provider: "RECURRENTE",
                // TODO: Reemplazar id de subscripcion
                providerSubscriptionId: data.id || "TODO_SUB_ID",
                // TODO: Reemplazar url de checkout
                checkoutUrl: data.checkout_url || data.url || `https://app.recurrente.com/c/${data.id}`,
                status: "PENDING",
                rawResponse: data
            };
        }
        catch (error) {
            console.error("RecurrenteGateway error:", error);
            throw error;
        }
    }
}
exports.RecurrenteSubscriptionGateway = RecurrenteSubscriptionGateway;
