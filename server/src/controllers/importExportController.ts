import { Response, NextFunction } from 'express';
import Papa from 'papaparse';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const exportTransactionsCSV = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: { account: true, category: true },
      orderBy: { date: 'desc' },
    });

    const rows = transactions.map((t) => ({
      ID: t.id,
      Date: t.date.toISOString().split('T')[0],
      Type: t.type,
      Amount: t.amount,
      Description: t.description,
      Category: t.category?.name || 'Uncategorized',
      Account: t.account?.name || '',
      PaymentMethod: t.paymentMethod,
      Tags: t.tags,
      Notes: t.notes || '',
    }));

    const csv = Papa.unparse(rows);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions_export.csv');
    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

export const exportBackupJSON = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const [user, accounts, categories, transactions, budgets, bills, goals, recurring] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, currency: true, dateFormat: true, theme: true },
      }),
      prisma.account.findMany({ where: { userId } }),
      prisma.category.findMany({ where: { userId } }),
      prisma.transaction.findMany({ where: { userId } }),
      prisma.budget.findMany({ where: { userId } }),
      prisma.bill.findMany({ where: { userId } }),
      prisma.savingsGoal.findMany({ where: { userId } }),
      prisma.recurringTransaction.findMany({ where: { userId } }),
    ]);

    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user,
      accounts,
      categories,
      transactions,
      budgets,
      bills,
      goals,
      recurring,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=expense_tracker_backup.json');
    return res.status(200).json(backupData);
  } catch (error) {
    next(error);
  }
};
