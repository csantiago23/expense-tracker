import { Router } from 'express';
import {
  getBills,
  createBill,
  updateBill,
  toggleBillPaid,
  deleteBill,
  billSchema,
} from '../controllers/billsController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getBills);
router.post('/', validateRequest(billSchema), createBill);
router.put('/:id', updateBill);
router.patch('/:id/paid', toggleBillPaid);
router.delete('/:id', deleteBill);

export default router;
