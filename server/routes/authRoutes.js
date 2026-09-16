import express from 'express';
import { login, signup, forgotPassword, resetPassword, getCurrentUser, updateProfile, uploadAvatar } from '../controllers/authController.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authRateLimiter, login);
router.post('/signup', authRateLimiter, signup);
router.post('/register', authRateLimiter, signup);
router.post('/forgot-password', authRateLimiter, forgotPassword);
router.post('/reset-password', authRateLimiter, resetPassword);
router.get('/me', getCurrentUser);
router.put('/profile', requireAuth, updateProfile);
router.post('/profile/update', requireAuth, updateProfile);
router.post('/avatar', requireAuth, uploadAvatar);
router.post('/profile/photo', requireAuth, uploadAvatar);

export default router;
