import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.get('/me', requireAuth, (req, res) => res.json({ id: req.user.id, name: req.user.name, email: req.user.email, contact: req.user.contact, location: req.user.location, role: req.user.role }));
export default router;
