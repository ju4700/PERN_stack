import Router from 'express';
import { userSignin, userSignup, getCurrentUser } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.post('/sign-in', userSignin);

router.post('/sign-up', userSignup);

router.get('/me', authMiddleware, getCurrentUser);

export default router;