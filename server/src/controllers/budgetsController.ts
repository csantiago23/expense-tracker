import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const budgetSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1, 'Category is required'),
    amount: z.number().positive('Budget amount must be greater than 0'),
    month: z.number().min(1).max(12),
    year: z.number().min(2020),
  }),
});

export const getBudgets = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month as string, 10) : now.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year as string, 10) : now.getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [budgets, transactions] = await Promise.all([
      prisma.budget.findMany({
        where: { userId, month, year },
        include: { category: true },
      }),
      prisma.transaction.findMany({
        where: {
          userId,
          type: 'EXPENSE',
          date: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    // Map spent amounts to categories
    const categorySpentMap: Record<string, number> = {};
    for (const t of transactions) {
      if (t.categoryId) {
        categorySpentMap[t.categoryId] = (categorySpentMap[t.categoryId] || 0) + t.amount;
      }
    }

    const budgetStats = budgets.map((b) => {
      const spent = categorySpentMap[b.categoryId] || 0;
      const remaining = Math.max(0, b.amount - spent);
      const percentage = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;

      let warningStatus: 'NORMAL' | 'WARNING_75' | 'WARNING_90' | 'EXCEEDED' = 'NORMAL';
      if (percentage >= 100) warningStatus = 'EXCEEDED';
      else if (percentage >= 90) warningStatus = 'WARNING_90';
      else if (percentage >= 75) warningStatus = 'WARNING_75';

      return {
        ...b,
        spent,
        remaining,
        percentage,
        warningStatus,
      };
    });

    return res.status(200).json({
      status: 'success',
      data: {
        month,
        year,
        budgets: budgetStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createOrUpdateBudget = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { categoryId, amount, month, year } = req.body;

    const existing = await prisma.budget.findFirst({
      where: { userId, categoryId, month, year },
    });

    let budget;
    if (existing) {
      budget = await prisma.budget.update({
        where: { id: existing.id },
        data: { amount: parseFloat(amount) },
        include: { category: true },
      });
    } else {
      budget = await prisma.budget.create({
        data: {
          userId,
          categoryId,
          amount: parseFloat(amount),
          month: parseInt(month, 10),
          year: parseInt(year, 10),
        },
        include: { category: true },
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { budget },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBudget = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const existing = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return next(new AppError('Budget not found', 404));
    }

    await prisma.budget.delete({ where: { id } });

    return res.status(200).json({
      status: 'success',
      message: 'Budget removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
