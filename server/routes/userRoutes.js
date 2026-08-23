import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { me, updateAvailability, updateMe } from '../controllers/userController.js';
const router = Router();
router.route('/me').get(requireAuth, me).patch(requireAuth, updateMe);
router.patch('/me/availability', requireAuth, updateAvailability);
export default router;
