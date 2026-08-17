"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubscriptionCheckoutSchema = void 0;
const zod_1 = require("zod");
exports.createSubscriptionCheckoutSchema = zod_1.z.object({
    planCode: zod_1.z.enum(["PRO", "PREMIUM"]),
    commerceName: zod_1.z.string().min(2, "El nombre del comercio es requerido"),
    responsibleName: zod_1.z.string().min(2, "El nombre del responsable es requerido"),
    email: zod_1.z.string().email("Debe ser un correo válido"),
    phone: zod_1.z.string().min(8, "El teléfono debe tener al menos 8 caracteres"),
    nit: zod_1.z.string().optional()
});
