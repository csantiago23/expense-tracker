import { Router } from 'express';
import {
  getNotifications,
  markNotificationRead,
} from '../controllers/notificationsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getNotifications);
router.patch('/:id/read', markNotificationRead);

export default router;
