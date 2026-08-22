import { Router } from 'express';
import { createClothing, getClothing, listClothing, myClothing, removeClothing, updateClothing } from '../controllers/clothingController.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.get('/mine', requireAuth, myClothing);
router.route('/').get(listClothing).post(requireAuth, createClothing);
router.route('/:id').get(getClothing).patch(requireAuth, updateClothing).delete(requireAuth, removeClothing);
export default router;
