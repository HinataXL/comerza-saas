import { Router } from 'express';
import { handleRelay } from '../controllers/qpaypro.controller';

const router = Router();

// Endpoint público que recibirá la redirección de QPayPro
router.get('/relay/:saleId', handleRelay);
router.post('/relay/:saleId', handleRelay);

export default router;
