import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const goalSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Goal name is required'),
    targetAmount: z.number().positive('Target amount must be positive'),
    currentAmount: z.number().default(0),
    deadline: z.string().optional().nullable(),
    color: z.string().default('#10b981'),
    category: z.string().default('General'),
  }),
});

export const getGoals = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const goals = await prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = goals.map((g) => {
      const percentage = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
      return {
        ...g,
        percentage,
      };
    });

    return res.status(200).json({
      status: 'success',
      data: { goals: formatted },
    });
  } catch (error) {
    next(error);
  }
};

export const createGoal = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { name, targetAmount, currentAmount, deadline, color, category } = req.body;

    const goal = await prisma.savingsGoal.create({
      data: {
        userId,
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: currentAmount ? parseFloat(currentAmount) : 0.0,
        deadline: deadline ? new Date(deadline) : null,
        color: color || '#10b981',
        category: category || 'General',
        isCompleted: currentAmount >= targetAmount,
      },
    });

    return res.status(201).json({
      status: 'success',
      data: { goal },
    });
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const { name, targetAmount, currentAmount, deadline, color, category } = req.body;

    const existing = await prisma.savingsGoal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return next(new AppError('Savings goal not found', 404));
    }

    const newTarget = targetAmount ? parseFloat(targetAmount) : existing.targetAmount;
    const newCurrent = currentAmount !== undefined ? parseFloat(currentAmount) : existing.currentAmount;

    const goal = await prisma.savingsGoal.update({
      where: { id },
      data: {
        ...(name && { name }),
        targetAmount: newTarget,
        currentAmount: newCurrent,
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(color && { color }),
        ...(category && { category }),
        isCompleted: newCurrent >= newTarget,
      },
    });

    return res.status(200).json({
      status: 'success',
      data: { goal },
    });
  } catch (error) {
    next(error);
  }
};

export const contributeGoal = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const { amount } = req.body;

    const existing = await prisma.savingsGoal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return next(new AppError('Savings goal not found', 404));
    }

    const newCurrent = existing.currentAmount + parseFloat(amount);
    const goal = await prisma.savingsGoal.update({
      where: { id },
      data: {
        currentAmount: newCurrent,
        isCompleted: newCurrent >= existing.targetAmount,
      },
    });

    return res.status(200).json({
      status: 'success',
      data: { goal },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGoal = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const existing = await prisma.savingsGoal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return next(new AppError('Savings goal not found', 404));
    }

    await prisma.savingsGoal.delete({ where: { id } });

    return res.status(200).json({
      status: 'success',
      message: 'Savings goal deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
