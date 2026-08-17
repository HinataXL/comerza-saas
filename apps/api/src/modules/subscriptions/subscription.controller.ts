import { Request, Response } from 'express';
import { subscriptionService } from './subscription.service';
import { createSubscriptionCheckoutSchema } from './subscription.types';
import { z } from 'zod';

export const createRecurrenteCheckout = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = createSubscriptionCheckoutSchema.parse(req.body);
    
    const result = await subscriptionService.createRecurrenteCheckout(input);
    
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error creating subscription checkout:", error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({ code: "VALIDATION_ERROR", message: error.errors });
      return;
    }

    if (error.message === 'El plan seleccionado no existe o no está activo.') {
      res.status(400).json({ code: "INVALID_PLAN_CODE", message: error.message });
      return;
    }

    res.status(500).json({ code: "INTERNAL_ERROR", message: "Ocurrió un error al procesar el pago" });
  }
};
