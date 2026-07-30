import { Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getDashboardSummary = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const now = new Date();

    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [accounts, monthTransactions, recentTransactions, upcomingBills, budgets, goals] = await Promise.all([
      prisma.account.findMany({ where: { userId } }),
      prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: currentMonthStart, lte: currentMonthEnd },
        },
      }),
      prisma.transaction.findMany({
        where: { userId },
        include: { category: true, account: true },
        orderBy: { date: 'desc' },
        take: 5,
      }),
      prisma.bill.findMany({
        where: { userId, isPaid: false },
        include: { category: true },
        orderBy: { dueDate: 'asc' },
        take: 4,
      }),
      prisma.budget.findMany({
        where: { userId, month: now.getMonth() + 1, year: now.getFullYear() },
        include: { category: true },
      }),
      prisma.savingsGoal.findMany({
        where: { userId },
        take: 3,
      }),
    ]);

    // Total balance across all accounts
    const totalBalance = accounts.reduce((acc, a) => acc + a.currentBalance, 0);

    // Income & Expense for current month
    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    for (const t of monthTransactions) {
      if (t.type === 'INCOME') monthlyIncome += t.amount;
      if (t.type === 'EXPENSE') monthlyExpenses += t.amount;
    }

    const savings = Math.max(0, monthlyIncome - monthlyExpenses);

    // Calculate budget progress
    const categorySpentMap: Record<string, number> = {};
    for (const t of monthTransactions) {
      if (t.type === 'EXPENSE' && t.categoryId) {
        categorySpentMap[t.categoryId] = (categorySpentMap[t.categoryId] || 0) + t.amount;
      }
    }

    const budgetProgress = budgets.map((b) => {
      const spent = categorySpentMap[b.categoryId] || 0;
      return {
        id: b.id,
        categoryName: b.category.name,
        color: b.category.color,
        amount: b.amount,
        spent,
        percentage: b.amount > 0 ? Math.min(100, Math.round((spent / b.amount) * 100)) : 0,
      };
    });

    return res.status(200).json({
      status: 'success',
      data: {
        summary: {
          totalBalance,
          monthlyIncome,
          monthlyExpenses,
          savings,
          spendingThisMonth: monthlyExpenses,
        },
        recentTransactions: recentTransactions.map((t) => ({
          ...t,
          tags: JSON.parse(t.tags || '[]'),
        })),
        upcomingBills,
        budgetProgress,
        savingsGoals: goals.map((g) => ({
          ...g,
          percentage: g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCategorySpendingReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate } = req.query;

    const where: any = { userId, type: 'EXPENSE' };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true },
    });

    const categoryMap: Record<string, { name: string; color: string; value: number }> = {};
    let totalSpent = 0;

    for (const t of transactions) {
      const catName = t.category?.name || 'Uncategorized';
      const catColor = t.category?.color || '#64748b';
      totalSpent += t.amount;

      if (!categoryMap[catName]) {
        categoryMap[catName] = { name: catName, color: catColor, value: 0 };
      }
      categoryMap[catName].value += t.amount;
    }

    const result = Object.values(categoryMap).map((cat) => ({
      ...cat,
      value: Math.round(cat.value * 100) / 100,
      percentage: totalSpent > 0 ? Math.round((cat.value / totalSpent) * 100) : 0,
    }));

    return res.status(200).json({
      status: 'success',
      data: {
        totalSpent: Math.round(totalSpent * 100) / 100,
        categories: result,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyTrendsReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const monthsParam = parseInt((req.query.months as string) || '6', 10);

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - monthsParam + 1, 1);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    const monthlyMap: Record<string, { month: string; income: number; expense: number; net: number }> = {};

    for (let i = monthsParam - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthlyMap[label] = { month: label, income: 0, expense: 0, net: 0 };
    }

    for (const t of transactions) {
      const label = new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (monthlyMap[label]) {
        if (t.type === 'INCOME') monthlyMap[label].income += t.amount;
        if (t.type === 'EXPENSE') monthlyMap[label].expense += t.amount;
        monthlyMap[label].net = monthlyMap[label].income - monthlyMap[label].expense;
      }
    }

    return res.status(200).json({
      status: 'success',
      data: {
        trends: Object.values(monthlyMap),
      },
    });
  } catch (error) {
    next(error);
  }
};
