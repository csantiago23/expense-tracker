import { prisma } from '../prisma.js';

export const defaultCategories = [
  { name: 'Salary', type: 'INCOME', color: '#10b981', icon: 'Banknote', isDefault: true },
  { name: 'Investment', type: 'INCOME', color: '#06b6d4', icon: 'TrendingUp', isDefault: true },
  { name: 'Housing', type: 'EXPENSE', color: '#8b5cf6', icon: 'Home', isDefault: true },
  { name: 'Utilities', type: 'EXPENSE', color: '#3b82f6', icon: 'Zap', isDefault: true },
  { name: 'Food', type: 'EXPENSE', color: '#f59e0b', icon: 'Utensils', isDefault: true },
  { name: 'Transportation', type: 'EXPENSE', color: '#ef4444', icon: 'Car', isDefault: true },
  { name: 'Entertainment', type: 'EXPENSE', color: '#ec4899', icon: 'Film', isDefault: true },
  { name: 'Shopping', type: 'EXPENSE', color: '#14b8a6', icon: 'ShoppingBag', isDefault: true },
  { name: 'Healthcare', type: 'EXPENSE', color: '#e11d48', icon: 'HeartPulse', isDefault: true },
  { name: 'Education', type: 'EXPENSE', color: '#6366f1', icon: 'GraduationCap', isDefault: true },
  { name: 'Travel', type: 'EXPENSE', color: '#f97316', icon: 'Plane', isDefault: true },
  { name: 'Miscellaneous', type: 'EXPENSE', color: '#64748b', icon: 'MoreHorizontal', isDefault: true },
];

export const defaultAccounts = [
  { name: 'Main Checking', type: 'CHECKING', currentBalance: 2500.0, color: '#3b82f6', institution: 'Chase', isDefault: true },
  { name: 'Emergency Savings', type: 'SAVINGS', currentBalance: 10000.0, color: '#10b981', institution: 'Ally Bank', isDefault: false },
  { name: 'Rewards Credit Card', type: 'CREDIT_CARD', currentBalance: -450.0, color: '#f59e0b', institution: 'Capital One', isDefault: false },
];

export async function createDefaultUserData(userId: string) {
  // Create default categories
  await prisma.category.createMany({
    data: defaultCategories.map((cat) => ({
      ...cat,
      userId,
    })),
  });

  // Create default accounts
  await prisma.account.createMany({
    data: defaultAccounts.map((acc) => ({
      ...acc,
      userId,
    })),
  });
}
