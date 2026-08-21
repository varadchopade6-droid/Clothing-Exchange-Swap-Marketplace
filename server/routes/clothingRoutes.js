import { Router } from 'express';
import { createClothing, listClothing } from '../controllers/clothingController.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.route('/').get(listClothing).post(requireAuth, createClothing);
export default router;
