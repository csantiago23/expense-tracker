import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const accountSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Account name is required'),
    type: z.enum(['CHECKING', 'SAVINGS', 'CASH', 'CREDIT_CARD', 'INVESTMENT']),
    currentBalance: z.number().default(0),
    color: z.string().default('#3b82f6'),
    institution: z.string().optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const getAccounts = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const accounts = await prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    return res.status(200).json({
      status: 'success',
      data: { accounts },
    });
  } catch (error) {
    next(error);
  }
};

export const createAccount = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { name, type, currentBalance, color, institution, isDefault } = req.body;

    if (isDefault) {
      await prisma.account.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const account = await prisma.account.create({
      data: {
        userId,
        name,
        type,
        currentBalance: currentBalance ?? 0,
        color: color || '#3b82f6',
        institution: institution || null,
        isDefault: isDefault ?? false,
      },
    });

    return res.status(201).json({
      status: 'success',
      data: { account },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAccount = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const { name, type, currentBalance, color, institution, isDefault } = req.body;

    const existing = await prisma.account.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return next(new AppError('Account not found', 404));
    }

    if (isDefault) {
      await prisma.account.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const account = await prisma.account.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(currentBalance !== undefined && { currentBalance }),
        ...(color && { color }),
        ...(institution !== undefined && { institution }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return res.status(200).json({
      status: 'success',
      data: { account },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const existing = await prisma.account.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return next(new AppError('Account not found', 404));
    }

    await prisma.account.delete({
      where: { id },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
