import { Router } from 'express';
import { register, login, logout, getMe, forgotPassword } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
