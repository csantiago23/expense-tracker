import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const transactionSchema = z.object({
  body: z.object({
    accountId: z.string().min(1, 'Account is required'),
    toAccountId: z.string().optional().nullable(),
    categoryId: z.string().optional().nullable(),
    amount: z.number().positive('Amount must be greater than 0'),
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
    date: z.string(),
    description: z.string().min(1, 'Description is required'),
    paymentMethod: z.string().default('Card'),
    isRecurring: z.boolean().optional(),
    notes: z.string().optional().nullable(),
    tags: z.array(z.string()).optional(),
  }),
});

// Helper function to update account balance
async function adjustAccountBalances(
  type: string,
  amount: number,
  accountId: string,
  toAccountId?: string | null,
  isReverse = false
) {
  const factor = isReverse ? -1 : 1;

  if (type === 'INCOME') {
    await prisma.account.update({
      where: { id: accountId },
      data: { currentBalance: { increment: amount * factor } },
    });
  } else if (type === 'EXPENSE') {
    await prisma.account.update({
      where: { id: accountId },
      data: { currentBalance: { decrement: amount * factor } },
    });
  } else if (type === 'TRANSFER' && toAccountId) {
    await prisma.account.update({
      where: { id: accountId },
      data: { currentBalance: { decrement: amount * factor } },
    });
    await prisma.account.update({
      where: { id: toAccountId },
      data: { currentBalance: { increment: amount * factor } },
    });
  }
}

export const getTransactions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const {
      search,
      type,
      accountId,
      categoryId,
      startDate,
      endDate,
      paymentMethod,
      sortBy = 'date',
      sortOrder = 'desc',
      page = '1',
      limit = '50',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { userId };

    if (search) {
      where.OR = [
        { description: { contains: search as string } },
        { notes: { contains: search as string } },
        { tags: { contains: search as string } },
      ];
    }

    if (type) where.type = type;
    if (accountId) where.accountId = accountId;
    if (categoryId) where.categoryId = categoryId;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          account: true,
          toAccount: true,
          category: true,
        },
        orderBy: { [sortBy as string]: sortOrder === 'asc' ? 'asc' : 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.transaction.count({ where }),
    ]);

    return res.status(200).json({
      status: 'success',
      data: {
        transactions: transactions.map((t) => ({
          ...t,
          tags: JSON.parse(t.tags || '[]'),
        })),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const {
      accountId,
      toAccountId,
      categoryId,
      amount,
      type,
      date,
      description,
      paymentMethod,
      isRecurring,
      notes,
    } = req.body;

    let tagsList: string[] = [];
    if (req.body['tags[]']) {
      tagsList = Array.isArray(req.body['tags[]']) ? req.body['tags[]'] : [req.body['tags[]']];
    } else if (req.body.tags) {
      if (typeof req.body.tags === 'string') {
        try {
          tagsList = JSON.parse(req.body.tags);
        } catch {
          tagsList = [req.body.tags];
        }
      } else if (Array.isArray(req.body.tags)) {
        tagsList = req.body.tags;
      }
    }

    const receiptUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return next(new AppError('Transaction amount must be a positive number', 400));
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId,
        toAccountId: toAccountId || null,
        categoryId: categoryId || null,
        amount: parsedAmount,
        type,
        date: new Date(date),
        description,
        paymentMethod: paymentMethod || 'Card',
        isRecurring: Boolean(isRecurring),
        notes: notes || null,
        receiptUrl: receiptUrl || null,
        tags: JSON.stringify(tagsList),
      },
      include: {
        account: true,
        toAccount: true,
        category: true,
      },
    });

    // Update account balances
    await adjustAccountBalances(type, parsedAmount, accountId, toAccountId);

    return res.status(201).json({
      status: 'success',
      data: {
        transaction: {
          ...transaction,
          tags: JSON.parse(transaction.tags || '[]'),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const {
      accountId,
      toAccountId,
      categoryId,
      amount,
      type,
      date,
      description,
      paymentMethod,
      isRecurring,
      notes,
      tags,
    } = req.body;

    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return next(new AppError('Transaction not found', 404));
    }

    // Reverse old transaction balances
    await adjustAccountBalances(existing.type, existing.amount, existing.accountId, existing.toAccountId, true);

    const receiptUrl = req.file ? `/uploads/${req.file.filename}` : existing.receiptUrl;

    const newAmount = amount ? parseFloat(amount) : existing.amount;
    const newType = type || existing.type;
    const newAccountId = accountId || existing.accountId;
    const newToAccountId = toAccountId !== undefined ? toAccountId : existing.toAccountId;

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...(accountId && { accountId }),
        toAccountId: newToAccountId,
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(amount && { amount: newAmount }),
        ...(type && { type }),
        ...(date && { date: new Date(date) }),
        ...(description && { description }),
        ...(paymentMethod && { paymentMethod }),
        ...(isRecurring !== undefined && { isRecurring: Boolean(isRecurring) }),
        ...(notes !== undefined && { notes: notes || null }),
        receiptUrl,
        ...(tags && { tags: JSON.stringify(tags) }),
      },
      include: {
        account: true,
        toAccount: true,
        category: true,
      },
    });

    // Apply new transaction balances
    await adjustAccountBalances(newType, newAmount, newAccountId, newToAccountId);

    return res.status(200).json({
      status: 'success',
      data: {
        transaction: {
          ...updated,
          tags: JSON.parse(updated.tags || '[]'),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return next(new AppError('Transaction not found', 404));
    }

    // Reverse balances
    await adjustAccountBalances(existing.type, existing.amount, existing.accountId, existing.toAccountId, true);

    await prisma.transaction.delete({
      where: { id },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Transaction deleted successfully',
      deletedTransaction: {
        ...existing,
        tags: JSON.parse(existing.tags || '[]'),
      },
    });
  } catch (error) {
    next(error);
  }
};
