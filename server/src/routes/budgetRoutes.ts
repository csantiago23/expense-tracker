import { Router } from 'express';
import {
  getBudgets,
  createOrUpdateBudget,
  deleteBudget,
  budgetSchema,
} from '../controllers/budgetsController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getBudgets);
router.post('/', validateRequest(budgetSchema), createOrUpdateBudget);
router.delete('/:id', deleteBudget);

export default router;
