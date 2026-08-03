import { Router } from 'express';
import { getSalesReport } from '../controllers/reports.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/sales', authenticate, getSalesReport);

export default router;
