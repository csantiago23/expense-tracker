import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  categorySchema,
} from '../controllers/categoriesController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getCategories);
router.post('/', validateRequest(categorySchema), createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
