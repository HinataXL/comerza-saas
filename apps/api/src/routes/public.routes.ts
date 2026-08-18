import { Router } from 'express';
import { handleReservationAction } from '../controllers/reservation.controller';

const router = Router();

router.get('/reservations/action', handleReservationAction);

export default router;
