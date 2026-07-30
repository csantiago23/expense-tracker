import { Router } from 'express';
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  accountSchema,
} from '../controllers/accountsController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getAccounts);
router.post('/', validateRequest(accountSchema), createAccount);
router.put('/:id', updateAccount);
router.delete('/:id', deleteAccount);

export default router;
