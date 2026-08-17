"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRecurrenteCheckout = void 0;
const subscription_service_1 = require("./subscription.service");
const subscription_types_1 = require("./subscription.types");
const zod_1 = require("zod");
const createRecurrenteCheckout = async (req, res) => {
    try {
        const input = subscription_types_1.createSubscriptionCheckoutSchema.parse(req.body);
        const result = await subscription_service_1.subscriptionService.createRecurrenteCheckout(input);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error creating subscription checkout:", error);
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ code: "VALIDATION_ERROR", message: error.issues });
            return;
        }
        if (error.message === 'El plan seleccionado no existe o no está activo.') {
            res.status(400).json({ code: "INVALID_PLAN_CODE", message: error.message });
            return;
        }
        res.status(500).json({ code: "INTERNAL_ERROR", message: "Ocurrió un error al procesar el pago" });
    }
};
exports.createRecurrenteCheckout = createRecurrenteCheckout;
