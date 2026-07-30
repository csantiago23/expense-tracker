import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const categorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required'),
    type: z.enum(['INCOME', 'EXPENSE']),
    color: z.string().default('#64748b'),
    icon: z.string().default('Tag'),
  }),
});

export const getCategories = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      status: 'success',
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { name, type, color, icon } = req.body;

    const category = await prisma.category.create({
      data: {
        userId,
        name,
        type,
        color: color || '#64748b',
        icon: icon || 'Tag',
      },
    });

    return res.status(201).json({
      status: 'success',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const { name, type, color, icon } = req.body;

    const existing = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return next(new AppError('Category not found', 404));
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(color && { color }),
        ...(icon && { icon }),
      },
    });

    return res.status(200).json({
      status: 'success',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const existing = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return next(new AppError('Category not found', 404));
    }

    await prisma.category.delete({
      where: { id },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
