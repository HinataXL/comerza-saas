import { Router } from 'express';
import { createSale, getSales, createQuickCharge, updateSaleStatus, getSaleById } from '../controllers/sales.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', getSales);
router.get('/:id', getSaleById);
router.post('/', createSale);
router.post('/quick-charge', createQuickCharge);
router.patch('/:id/status', updateSaleStatus);

export default router;
