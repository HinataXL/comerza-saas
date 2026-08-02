import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getDashboardMetrics);

export default router;
