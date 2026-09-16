import express from 'express';
import { getConversations, getMessages, sendMessage } from '../controllers/chatController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/conversations', requireAuth, getConversations);
router.get('/messages/:recipientId', requireAuth, getMessages);
router.post('/messages', requireAuth, sendMessage);

export default router;
