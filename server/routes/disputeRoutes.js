import { Router } from 'express'; import { createDispute, myDisputes } from '../controllers/disputeController.js'; import { requireAuth } from '../middleware/auth.js';
const router = Router(); router.use(requireAuth); router.route('/').get(myDisputes).post(createDispute); export default router;
