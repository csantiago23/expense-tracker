import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const recurringSchema = z.object({
  body: z.object({
    accountId: z.string().min(1, 'Account is required'),
    categoryId: z.string().optional().nullable(),
    amount: z.number().positive('Amount must be positive'),
    type: z.enum(['INCOME', 'EXPENSE']),
    frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
    startDate: z.string(),
    endDate: z.string().optional().nullable(),
    description: z.string().min(1, 'Description is required'),
    paymentMethod: z.string().default('Card'),
  }),
});

export const getRecurringTransactions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const recurring = await prisma.recurringTransaction.findMany({
      where: { userId },
      include: { account: true, category: true },
      orderBy: { nextDueDate: 'asc' },
    });

    return res.status(200).json({
      status: 'success',
      data: { recurring },
    });
  } catch (error) {
    next(error);
  }
};

export const createRecurringTransaction = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const {
      accountId,
      categoryId,
      amount,
      type,
      frequency,
      startDate,
      endDate,
      description,
      paymentMethod,
    } = req.body;

    const start = new Date(startDate);

    const recurring = await prisma.recurringTransaction.create({
      data: {
        userId,
        accountId,
        categoryId: categoryId || null,
        amount: parseFloat(amount),
        type,
        frequency,
        startDate: start,
        endDate: endDate ? new Date(endDate) : null,
        nextDueDate: start,
        description,
        paymentMethod: paymentMethod || 'Card',
        active: true,
      },
      include: { account: true, category: true },
    });

    return res.status(201).json({
      status: 'success',
      data: { recurring },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRecurringTransaction = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const existing = await prisma.recurringTransaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return next(new AppError('Recurring transaction rule not found', 404));
    }

    await prisma.recurringTransaction.delete({ where: { id } });

    return res.status(200).json({
      status: 'success',
      message: 'Recurring rule deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
