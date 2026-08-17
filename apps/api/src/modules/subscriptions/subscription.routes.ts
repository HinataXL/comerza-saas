import { Router } from 'express';
import { createRecurrenteCheckout } from './subscription.controller';

const router = Router();

router.post('/recurrente/checkout', createRecurrenteCheckout);

export default router;
