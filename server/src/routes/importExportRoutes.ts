import { Router } from 'express';
import {
  exportTransactionsCSV,
  exportBackupJSON,
} from '../controllers/importExportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/csv', exportTransactionsCSV);
router.get('/backup', exportBackupJSON);

export default router;
