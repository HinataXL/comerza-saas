import { z } from "zod";

export const createSubscriptionCheckoutSchema = z.object({
  planCode: z.enum(["PRO", "PREMIUM"]),
  commerceName: z.string().min(2, "El nombre del comercio es requerido"),
  responsibleName: z.string().min(2, "El nombre del responsable es requerido"),
  email: z.string().email("Debe ser un correo válido"),
  phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres"),
  nit: z.string().optional()
});

export type CreateSubscriptionCheckoutInput = z.infer<typeof createSubscriptionCheckoutSchema>;
