import { Router } from 'express';
import { getReservations, createReservation, updateReservation, deleteReservation } from '../controllers/reservation.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas de reservaciones requieren autenticación
router.use(authenticate);

router.get('/', getReservations);
router.post('/', createReservation);
router.put('/:id', updateReservation);
router.delete('/:id', deleteReservation);

export default router;
