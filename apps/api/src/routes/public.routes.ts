import { Router } from 'express';
import { handleReservationAction } from '../controllers/reservation.controller';

import { createPublicLog } from '../controllers/logs.controller';

const router = Router();

router.get('/reservations/action', handleReservationAction);
router.post('/logs', createPublicLog);

export default router;
