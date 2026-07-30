import { Router } from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionsController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../utils/multer.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getTransactions);
router.post('/', upload.single('receipt'), createTransaction);
router.put('/:id', upload.single('receipt'), updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
