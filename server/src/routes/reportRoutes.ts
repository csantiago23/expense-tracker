import { Router } from 'express';
import {
  getDashboardSummary,
  getCategorySpendingReport,
  getMonthlyTrendsReport,
} from '../controllers/reportsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/dashboard', getDashboardSummary);
router.get('/category-spending', getCategorySpendingReport);
router.get('/monthly-trends', getMonthlyTrendsReport);

export default router;
