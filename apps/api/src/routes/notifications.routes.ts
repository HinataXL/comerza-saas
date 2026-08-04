import { Router } from 'express';
import { getNotifications, markAsRead, streamNotifications } from '../controllers/notifications.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/stream', streamNotifications);
router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);

export default router;
