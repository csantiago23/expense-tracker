import { Router } from 'express';
import {
  getGoals,
  createGoal,
  updateGoal,
  contributeGoal,
  deleteGoal,
  goalSchema,
} from '../controllers/goalsController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getGoals);
router.post('/', validateRequest(goalSchema), createGoal);
router.put('/:id', updateGoal);
router.post('/:id/contribute', contributeGoal);
router.delete('/:id', deleteGoal);

export default router;
