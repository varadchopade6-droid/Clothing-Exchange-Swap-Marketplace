import { Router } from 'express';
import { createSwap, listSwaps, transitionSwap } from '../controllers/swapController.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.use(requireAuth);
router.route('/').get(listSwaps).post(createSwap);
router.patch('/:id', transitionSwap);
export default router;
