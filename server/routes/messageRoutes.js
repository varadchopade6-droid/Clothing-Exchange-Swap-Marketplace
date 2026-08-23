import { Router } from 'express';
import { conversations, messages, sendMessage } from '../controllers/messageController.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router(); router.use(requireAuth); router.get('/conversations', conversations); router.route('/:swapId').get(messages).post(sendMessage); export default router;
