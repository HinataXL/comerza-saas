"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionService = exports.SubscriptionService = void 0;
const prisma_1 = require("../../lib/prisma");
const recurrente_gateway_1 = require("./gateways/recurrente/recurrente.gateway");
class SubscriptionService {
    recurrenteGateway;
    constructor() {
        this.recurrenteGateway = new recurrente_gateway_1.RecurrenteSubscriptionGateway();
    }
    async createRecurrenteCheckout(input) {
        const plan = await prisma_1.prisma.plan.findUnique({
            where: { code: input.planCode }
        });
        if (!plan || !plan.isActive) {
            throw new Error("El plan seleccionado no existe o no está activo.");
        }
        if (!plan.recurrentePlanId) {
            throw new Error("El plan seleccionado no tiene un ID de Recurrente configurado.");
        }
        const tenant = await prisma_1.prisma.tenant.create({
            data: {
                name: input.commerceName,
                nit: input.nit,
                responsibleName: input.responsibleName,
                email: input.email,
                phone: input.phone,
                status: "PENDING_PAYMENT"
            }
        });
        const subscription = await prisma_1.prisma.subscription.create({
            data: {
                tenantId: tenant.id,
                planId: plan.id,
                provider: "RECURRENTE",
                status: "PENDING",
                amount: plan.monthlyPrice,
                currency: plan.currency,
                billingCycle: "MONTHLY"
            }
        });
        const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';
        const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost:8080';
        const gatewayResponse = await this.recurrenteGateway.createSubscriptionCheckout({
            planCode: input.planCode,
            gatewayPlanId: plan.recurrentePlanId,
            amount: Number(plan.monthlyPrice),
            currency: plan.currency,
            commerceName: tenant.name,
            responsibleName: tenant.responsibleName || '',
            email: tenant.email || '',
            phone: tenant.phone || '',
            nit: tenant.nit || undefined,
            successUrl: `${APP_BASE_URL}/subscription/success`,
            cancelUrl: `${APP_BASE_URL}/subscription/cancel`,
            webhookUrl: `${BACKEND_BASE_URL}/api/webhooks/recurrente`,
            metadata: {
                tenantId: tenant.id,
                subscriptionId: subscription.id,
                planCode: plan.code
            }
        });
        await prisma_1.prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                providerSubscriptionId: gatewayResponse.providerSubscriptionId,
                providerCustomerId: gatewayResponse.providerCustomerId,
                checkoutUrl: gatewayResponse.checkoutUrl,
                rawGatewayResponse: gatewayResponse.rawResponse
            }
        });
        return {
            tenantId: tenant.id,
            subscriptionId: subscription.id,
            status: "PENDING",
            checkoutUrl: gatewayResponse.checkoutUrl
        };
    }
}
exports.SubscriptionService = SubscriptionService;
exports.subscriptionService = new SubscriptionService();
