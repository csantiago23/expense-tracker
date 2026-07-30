import { Router } from 'express';
import {
  getRecurringTransactions,
  createRecurringTransaction,
  deleteRecurringTransaction,
  recurringSchema,
} from '../controllers/recurringController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getRecurringTransactions);
router.post('/', validateRequest(recurringSchema), createRecurringTransaction);
router.delete('/:id', deleteRecurringTransaction);

export default router;
