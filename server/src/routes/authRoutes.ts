import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from '../controllers/authController.js';
import { validateRequest } from '../middleware/validate.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, validateRequest(updateProfileSchema), updateProfile);

export default router;
