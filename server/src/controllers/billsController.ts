import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const billSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Bill name is required'),
    amount: z.number().positive('Amount must be positive'),
    dueDate: z.string(),
    categoryId: z.string().optional().nullable(),
    isPaid: z.boolean().optional(),
    isRecurring: z.boolean().optional(),
    reminderDays: z.number().default(3),
    notes: z.string().optional().nullable(),
  }),
});

export const getBills = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const bills = await prisma.bill.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { dueDate: 'asc' },
    });

    const now = new Date();
    const formatted = bills.map((bill) => {
      const isLate = !bill.isPaid && new Date(bill.dueDate) < now;
      return {
        ...bill,
        isLate,
      };
    });

    return res.status(200).json({
      status: 'success',
      data: { bills: formatted },
    });
  } catch (error) {
    next(error);
  }
};

export const createBill = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { name, amount, dueDate, categoryId, isPaid, isRecurring, reminderDays, notes } = req.body;

    const bill = await prisma.bill.create({
      data: {
        userId,
        name,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        categoryId: categoryId || null,
        isPaid: Boolean(isPaid),
        isRecurring: Boolean(isRecurring),
        reminderDays: reminderDays ? parseInt(reminderDays, 10) : 3,
        notes: notes || null,
      },
      include: { category: true },
    });

    return res.status(201).json({
      status: 'success',
      data: { bill },
    });
  } catch (error) {
    next(error);
  }
};

export const updateBill = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const { name, amount, dueDate, categoryId, isPaid, isRecurring, reminderDays, notes } = req.body;

    const existing = await prisma.bill.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return next(new AppError('Bill not found', 404));
    }

    const bill = await prisma.bill.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(isPaid !== undefined && { isPaid: Boolean(isPaid) }),
        ...(isRecurring !== undefined && { isRecurring: Boolean(isRecurring) }),
        ...(reminderDays && { reminderDays: parseInt(reminderDays, 10) }),
        ...(notes !== undefined && { notes: notes || null }),
      },
      include: { category: true },
    });

    return res.status(200).json({
      status: 'success',
      data: { bill },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleBillPaid = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const existing = await prisma.bill.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return next(new AppError('Bill not found', 404));
    }

    const bill = await prisma.bill.update({
      where: { id },
      data: { isPaid: !existing.isPaid },
      include: { category: true },
    });

    return res.status(200).json({
      status: 'success',
      data: { bill },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBill = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const existing = await prisma.bill.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return next(new AppError('Bill not found', 404));
    }

    await prisma.bill.delete({ where: { id } });

    return res.status(200).json({
      status: 'success',
      message: 'Bill deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
