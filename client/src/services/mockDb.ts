// Mock Database Service using localStorage
import { User, Account, Category, Transaction, Budget, Bill, SavingsGoal, Notification } from '../types';

const KEYS = {
  USER: 'et_mock_user',
  ACCOUNTS: 'et_mock_accounts',
  CATEGORIES: 'et_mock_categories',
  TRANSACTIONS: 'et_mock_transactions',
  BUDGETS: 'et_mock_budgets',
  BILLS: 'et_mock_bills',
  GOALS: 'et_mock_goals',
  NOTIFICATIONS: 'et_mock_notifications',
  IS_INITIALIZED: 'et_mock_initialized',
};

// Helper: Seed Data Generator
const initializeDatabase = () => {
  if (localStorage.getItem(KEYS.IS_INITIALIZED) === 'true') {
    return;
  }

  const now = new Date();
  const generateDate = (daysAgo: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString();
  };

  // 1. User
  const user: User = {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'demo@expensetracker.com',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    theme: 'dark',
    language: 'en',
  };

  // 2. Categories
  const categories: Category[] = [
    { id: 'cat-1', userId: 'user-1', name: 'Salary', type: 'INCOME', color: '#10b981', icon: 'Banknote', isDefault: true },
    { id: 'cat-2', userId: 'user-1', name: 'Freelance / Investments', type: 'INCOME', color: '#06b6d4', icon: 'TrendingUp', isDefault: true },
    { id: 'cat-3', userId: 'user-1', name: 'Housing', type: 'EXPENSE', color: '#8b5cf6', icon: 'Home', isDefault: true },
    { id: 'cat-4', userId: 'user-1', name: 'Utilities', type: 'EXPENSE', color: '#3b82f6', icon: 'Zap', isDefault: true },
    { id: 'cat-5', userId: 'user-1', name: 'Food & Dining', type: 'EXPENSE', color: '#f59e0b', icon: 'Utensils', isDefault: true },
    { id: 'cat-6', userId: 'user-1', name: 'Transportation', type: 'EXPENSE', color: '#ef4444', icon: 'Car', isDefault: true },
    { id: 'cat-7', userId: 'user-1', name: 'Entertainment', type: 'EXPENSE', color: '#ec4899', icon: 'Film', isDefault: true },
    { id: 'cat-8', userId: 'user-1', name: 'Shopping', type: 'EXPENSE', color: '#14b8a6', icon: 'ShoppingBag', isDefault: true },
    { id: 'cat-9', userId: 'user-1', name: 'Healthcare', type: 'EXPENSE', color: '#e11d48', icon: 'HeartPulse', isDefault: true },
    { id: 'cat-10', userId: 'user-1', name: 'Education', type: 'EXPENSE', color: '#6366f1', icon: 'GraduationCap', isDefault: true },
    { id: 'cat-11', userId: 'user-1', name: 'Travel', type: 'EXPENSE', color: '#f97316', icon: 'Plane', isDefault: true },
    { id: 'cat-12', userId: 'user-1', name: 'Miscellaneous', type: 'EXPENSE', color: '#64748b', icon: 'MoreHorizontal', isDefault: true },
  ];

  // 3. Accounts
  const accounts: Account[] = [
    { id: 'acc-1', userId: 'user-1', name: 'Main Checking', type: 'CHECKING', currentBalance: 4250.0, color: '#3b82f6', institution: 'Chase Bank', isDefault: true },
    { id: 'acc-2', userId: 'user-1', name: 'High-Yield Savings', type: 'SAVINGS', currentBalance: 12800.0, color: '#10b981', institution: 'Ally Financial', isDefault: false },
    { id: 'acc-3', userId: 'user-1', name: 'Sapphire Credit Card', type: 'CREDIT_CARD', currentBalance: -620.5, color: '#f59e0b', institution: 'Chase', isDefault: false },
  ];

  // 4. Transactions over past 60 days
  const transactions: Transaction[] = [
    {
      id: 'tx-1',
      userId: 'user-1',
      accountId: 'acc-1',
      amount: 4500.0,
      type: 'INCOME',
      date: generateDate(1),
      description: 'Monthly Salary Deposit',
      paymentMethod: 'Bank Transfer',
      isRecurring: true,
      tags: ['Essential'],
      categoryId: 'cat-1',
    },
    {
      id: 'tx-2',
      userId: 'user-1',
      accountId: 'acc-1',
      amount: 850.0,
      type: 'INCOME',
      date: generateDate(12),
      description: 'UI/UX Freelance Project Payment',
      paymentMethod: 'Bank Transfer',
      isRecurring: false,
      tags: ['Tax-Deductible'],
      categoryId: 'cat-2',
    },
    {
      id: 'tx-3',
      userId: 'user-1',
      accountId: 'acc-1',
      amount: 1650.0,
      type: 'EXPENSE',
      date: generateDate(2),
      description: 'Apartment Rent Payment',
      paymentMethod: 'Bank Transfer',
      isRecurring: true,
      tags: ['Essential'],
      categoryId: 'cat-3',
    },
    {
      id: 'tx-4',
      userId: 'user-1',
      accountId: 'acc-3',
      amount: 145.2,
      type: 'EXPENSE',
      date: generateDate(3),
      description: 'Whole Foods Market',
      paymentMethod: 'Card',
      isRecurring: false,
      tags: ['Essential'],
      categoryId: 'cat-5',
    },
    {
      id: 'tx-5',
      userId: 'user-1',
      accountId: 'acc-3',
      amount: 68.5,
      type: 'EXPENSE',
      date: generateDate(5),
      description: 'Italian Bistro Dinner',
      paymentMethod: 'Card',
      isRecurring: false,
      tags: ['Personal'],
      categoryId: 'cat-5',
    },
    {
      id: 'tx-6',
      userId: 'user-1',
      accountId: 'acc-3',
      amount: 45.0,
      type: 'EXPENSE',
      date: generateDate(6),
      description: 'Shell Gas Station Fill-up',
      paymentMethod: 'Card',
      isRecurring: false,
      tags: ['Essential'],
      categoryId: 'cat-6',
    },
    {
      id: 'tx-7',
      userId: 'user-1',
      accountId: 'acc-3',
      amount: 120.0,
      type: 'EXPENSE',
      date: generateDate(8),
      description: 'Electric & Gas Bill',
      paymentMethod: 'Online',
      isRecurring: true,
      tags: ['Essential', 'Subscription'],
      categoryId: 'cat-4',
    },
    {
      id: 'tx-8',
      userId: 'user-1',
      accountId: 'acc-3',
      amount: 18.99,
      type: 'EXPENSE',
      date: generateDate(10),
      description: 'Netflix Monthly Subscription',
      paymentMethod: 'Card',
      isRecurring: true,
      tags: ['Subscription'],
      categoryId: 'cat-7',
    },
    {
      id: 'tx-9',
      userId: 'user-1',
      accountId: 'acc-3',
      amount: 210.0,
      type: 'EXPENSE',
      date: generateDate(14),
      description: 'New Running Shoes',
      paymentMethod: 'Card',
      isRecurring: false,
      tags: ['Personal'],
      categoryId: 'cat-8',
    },
    {
      id: 'tx-10',
      userId: 'user-1',
      accountId: 'acc-3',
      amount: 75.0,
      type: 'EXPENSE',
      date: generateDate(18),
      description: 'Pharmacy & Co-pay',
      paymentMethod: 'Card',
      isRecurring: false,
      tags: ['Essential'],
      categoryId: 'cat-9',
    },
    {
      id: 'tx-11',
      userId: 'user-1',
      accountId: 'acc-1',
      toAccountId: 'acc-2',
      amount: 500.0,
      type: 'TRANSFER',
      date: generateDate(4),
      description: 'Monthly Savings Transfer',
      paymentMethod: 'Bank Transfer',
      isRecurring: true,
      tags: ['Personal'],
      categoryId: null,
    },
  ];

  // 5. Budgets
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const budgets: Budget[] = [
    { id: 'b-1', userId: 'user-1', categoryId: 'cat-5', amount: 600.0, spent: 213.7, remaining: 386.3, percentage: 35, month: currentMonth, year: currentYear, warningStatus: 'NORMAL', category: categories[4] },
    { id: 'b-2', userId: 'user-1', categoryId: 'cat-3', amount: 1700.0, spent: 1650.0, remaining: 50.0, percentage: 97, month: currentMonth, year: currentYear, warningStatus: 'WARNING_90', category: categories[2] },
    { id: 'b-3', userId: 'user-1', categoryId: 'cat-6', amount: 250.0, spent: 45.0, remaining: 205.0, percentage: 18, month: currentMonth, year: currentYear, warningStatus: 'NORMAL', category: categories[5] },
    { id: 'b-4', userId: 'user-1', categoryId: 'cat-7', amount: 150.0, spent: 18.99, remaining: 131.01, percentage: 12, month: currentMonth, year: currentYear, warningStatus: 'NORMAL', category: categories[6] },
    { id: 'b-5', userId: 'user-1', categoryId: 'cat-8', amount: 300.0, spent: 210.0, remaining: 90.0, percentage: 70, month: currentMonth, year: currentYear, warningStatus: 'NORMAL', category: categories[7] },
  ];

  // 6. Bills
  const bills: Bill[] = [
    {
      id: 'bill-1',
      userId: 'user-1',
      name: 'High-Speed Internet',
      amount: 79.99,
      dueDate: new Date(now.getFullYear(), now.getMonth(), 28).toISOString(),
      isPaid: false,
      isRecurring: true,
      reminderDays: 3,
      categoryId: 'cat-4',
    },
    {
      id: 'bill-2',
      userId: 'user-1',
      name: 'Car Insurance Premium',
      amount: 135.0,
      dueDate: new Date(now.getFullYear(), now.getMonth(), 30).toISOString(),
      isPaid: false,
      isRecurring: true,
      reminderDays: 5,
      categoryId: 'cat-6',
    },
    {
      id: 'bill-3',
      userId: 'user-1',
      name: 'Gym Membership',
      amount: 49.0,
      dueDate: new Date(now.getFullYear(), now.getMonth(), 25).toISOString(),
      isPaid: true,
      isRecurring: true,
      reminderDays: 2,
      categoryId: 'cat-9',
    },
  ];

  // 7. Goals
  const goals: SavingsGoal[] = [
    {
      id: 'goal-1',
      userId: 'user-1',
      name: 'Emergency Fund (6 Months)',
      targetAmount: 15000.0,
      currentAmount: 12800.0,
      deadline: new Date(now.getFullYear(), 11, 31).toISOString(),
      color: '#10b981',
      category: 'Emergency',
      isCompleted: false,
    },
    {
      id: 'goal-2',
      userId: 'user-1',
      name: 'Japan Vacation 2027',
      targetAmount: 5000.0,
      currentAmount: 2200.0,
      deadline: new Date(now.getFullYear() + 1, 4, 1).toISOString(),
      color: '#f59e0b',
      category: 'Travel',
      isCompleted: false,
    },
    {
      id: 'goal-3',
      userId: 'user-1',
      name: 'Tech Upgrade (MacBook)',
      targetAmount: 2500.0,
      currentAmount: 1950.0,
      deadline: new Date(now.getFullYear(), 8, 30).toISOString(),
      color: '#3b82f6',
      category: 'Gadgets',
      isCompleted: false,
    },
  ];

  // 8. Notifications
  const notifications: Notification[] = [
    {
      id: 'notif-1',
      type: 'BILL_REMINDER',
      title: 'Upcoming Bill: High-Speed Internet',
      message: 'Your bill of $79.99 is due on the 28th of this month.',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-2',
      type: 'BUDGET_ALERT',
      title: 'Food & Dining Budget Notice',
      message: 'You have spent 35% of your $600 monthly Food & Dining budget.',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ];

  localStorage.setItem(KEYS.USER, JSON.stringify(user));
  localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  localStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets));
  localStorage.setItem(KEYS.BILLS, JSON.stringify(bills));
  localStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  localStorage.setItem(KEYS.IS_INITIALIZED, 'true');
};

// Database Getters/Setters helpers
const getTable = <T>(key: string): T[] => {
  initializeDatabase();
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setTable = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const getObj = <T>(key: string): T | null => {
  initializeDatabase();
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

const setObj = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Database operations implementing routes logic
export const db = {
  // Auth
  getCurrentUser: () => getObj<User>(KEYS.USER),
  updateCurrentUser: (userData: Partial<User>) => {
    const current = getObj<User>(KEYS.USER);
    if (!current) return null;
    const updated = { ...current, ...userData };
    setObj(KEYS.USER, updated);
    return updated;
  },
  login: (email: string) => {
    initializeDatabase();
    const user = getObj<User>(KEYS.USER);
    if (user && user.email === email) {
      return { token: 'mock-jwt-token', user };
    }
    throw new Error('Invalid email or password');
  },

  // Accounts
  getAccounts: () => getTable<Account>(KEYS.ACCOUNTS),
  createAccount: (data: Omit<Account, 'id' | 'userId'>) => {
    const accounts = getTable<Account>(KEYS.ACCOUNTS);
    const newAccount: Account = {
      ...data,
      id: `acc-${Date.now()}`,
      userId: 'user-1',
    };
    if (newAccount.isDefault) {
      accounts.forEach(a => a.isDefault = false);
    }
    accounts.push(newAccount);
    setTable(KEYS.ACCOUNTS, accounts);
    return newAccount;
  },
  updateAccount: (id: string, data: Partial<Account>) => {
    const accounts = getTable<Account>(KEYS.ACCOUNTS);
    const index = accounts.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Account not found');
    
    if (data.isDefault) {
      accounts.forEach(a => a.isDefault = false);
    }
    
    accounts[index] = { ...accounts[index], ...data };
    setTable(KEYS.ACCOUNTS, accounts);
    return accounts[index];
  },
  deleteAccount: (id: string) => {
    const accounts = getTable<Account>(KEYS.ACCOUNTS);
    const filtered = accounts.filter(a => a.id !== id);
    setTable(KEYS.ACCOUNTS, filtered);
    return { success: true };
  },

  // Categories
  getCategories: () => getTable<Category>(KEYS.CATEGORIES),
  createCategory: (data: Omit<Category, 'id' | 'userId' | 'isDefault'>) => {
    const categories = getTable<Category>(KEYS.CATEGORIES);
    const newCategory: Category = {
      ...data,
      id: `cat-${Date.now()}`,
      userId: 'user-1',
      isDefault: false,
    };
    categories.push(newCategory);
    setTable(KEYS.CATEGORIES, categories);
    return newCategory;
  },
  updateCategory: (id: string, data: Partial<Category>) => {
    const categories = getTable<Category>(KEYS.CATEGORIES);
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Category not found');
    categories[index] = { ...categories[index], ...data };
    setTable(KEYS.CATEGORIES, categories);
    return categories[index];
  },
  deleteCategory: (id: string) => {
    const categories = getTable<Category>(KEYS.CATEGORIES);
    const filtered = categories.filter(c => c.id !== id);
    setTable(KEYS.CATEGORIES, filtered);
    return { success: true };
  },

  // Transactions
  getTransactions: (filters: {
    type?: string;
    accountId?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  } = {}) => {
    let transactions = getTable<Transaction>(KEYS.TRANSACTIONS);
    const accounts = getTable<Account>(KEYS.ACCOUNTS);
    const categories = getTable<Category>(KEYS.CATEGORIES);

    // Apply filters
    if (filters.type && filters.type !== 'all') {
      transactions = transactions.filter(t => t.type === filters.type);
    }
    if (filters.accountId) {
      transactions = transactions.filter(t => t.accountId === filters.accountId || t.toAccountId === filters.accountId);
    }
    if (filters.categoryId) {
      transactions = transactions.filter(t => t.categoryId === filters.categoryId);
    }
    if (filters.startDate) {
      const start = new Date(filters.startDate).getTime();
      transactions = transactions.filter(t => new Date(t.date).getTime() >= start);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate).getTime();
      transactions = transactions.filter(t => new Date(t.date).getTime() <= end);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      transactions = transactions.filter(
        t => t.description?.toLowerCase().includes(searchLower) ||
             t.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Sort descending by date
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Populate objects
    return transactions.map(t => {
      const populated = { ...t };
      populated.account = accounts.find(a => a.id === t.accountId);
      if (t.toAccountId) {
        populated.toAccount = accounts.find(a => a.id === t.toAccountId);
      }
      if (t.categoryId) {
        populated.category = categories.find(c => c.id === t.categoryId);
      }
      return populated;
    });
  },
  createTransaction: (data: any) => {
    const transactions = getTable<Transaction>(KEYS.TRANSACTIONS);
    const accounts = getTable<Account>(KEYS.ACCOUNTS);

    const amountNum = parseFloat(data.amount);
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: 'user-1',
      accountId: data.accountId,
      toAccountId: data.toAccountId || null,
      categoryId: data.categoryId || null,
      amount: amountNum,
      type: data.type,
      date: data.date || new Date().toISOString(),
      description: data.description,
      paymentMethod: data.paymentMethod || 'Other',
      isRecurring: data.isRecurring === 'true' || data.isRecurring === true,
      notes: data.notes || '',
      tags: Array.isArray(data.tags) ? data.tags : (typeof data.tags === 'string' ? JSON.parse(data.tags) : []),
    };

    // Update balances
    const accIndex = accounts.findIndex(a => a.id === newTx.accountId);
    if (accIndex !== -1) {
      if (newTx.type === 'INCOME') {
        accounts[accIndex].currentBalance += amountNum;
      } else if (newTx.type === 'EXPENSE') {
        accounts[accIndex].currentBalance -= amountNum;
      } else if (newTx.type === 'TRANSFER' && newTx.toAccountId) {
        accounts[accIndex].currentBalance -= amountNum;
        const destIndex = accounts.findIndex(a => a.id === newTx.toAccountId);
        if (destIndex !== -1) {
          accounts[destIndex].currentBalance += amountNum;
        }
      }
    }

    transactions.push(newTx);
    setTable(KEYS.TRANSACTIONS, transactions);
    setTable(KEYS.ACCOUNTS, accounts);

    return newTx;
  },
  deleteTransaction: (id: string) => {
    const transactions = getTable<Transaction>(KEYS.TRANSACTIONS);
    const accounts = getTable<Account>(KEYS.ACCOUNTS);

    const tx = transactions.find(t => t.id === id);
    if (!tx) throw new Error('Transaction not found');

    // Revert balances
    const accIndex = accounts.findIndex(a => a.id === tx.accountId);
    if (accIndex !== -1) {
      if (tx.type === 'INCOME') {
        accounts[accIndex].currentBalance -= tx.amount;
      } else if (tx.type === 'EXPENSE') {
        accounts[accIndex].currentBalance += tx.amount;
      } else if (tx.type === 'TRANSFER' && tx.toAccountId) {
        accounts[accIndex].currentBalance += tx.amount;
        const destIndex = accounts.findIndex(a => a.id === tx.toAccountId);
        if (destIndex !== -1) {
          accounts[destIndex].currentBalance -= tx.amount;
        }
      }
    }

    const filtered = transactions.filter(t => t.id !== id);
    setTable(KEYS.TRANSACTIONS, filtered);
    setTable(KEYS.ACCOUNTS, accounts);
    return { success: true };
  },

  // Budgets
  getBudgets: (month: number, year: number) => {
    const budgets = getTable<Budget>(KEYS.BUDGETS).filter(b => b.month === month && b.year === year);
    const categories = getTable<Category>(KEYS.CATEGORIES);
    const transactions = getTable<Transaction>(KEYS.TRANSACTIONS);

    // Calculate actual spent per category for the specified month
    const start = new Date(year, month - 1, 1).getTime();
    const end = new Date(year, month, 0, 23, 59, 59).getTime();

    const catSpentMap: Record<string, number> = {};
    transactions.forEach(t => {
      const txTime = new Date(t.date).getTime();
      if (t.type === 'EXPENSE' && t.categoryId && txTime >= start && txTime <= end) {
        catSpentMap[t.categoryId] = (catSpentMap[t.categoryId] || 0) + t.amount;
      }
    });

    return budgets.map(b => {
      const spent = catSpentMap[b.categoryId] || 0;
      const category = categories.find(c => c.id === b.categoryId) || { name: 'Unknown', color: '#64748b' } as Category;
      const percentage = b.amount > 0 ? Math.min(100, Math.round((spent / b.amount) * 100)) : 0;
      
      let warningStatus: Budget['warningStatus'] = 'NORMAL';
      if (spent >= b.amount) warningStatus = 'EXCEEDED';
      else if (spent / b.amount >= 0.9) warningStatus = 'WARNING_90';
      else if (spent / b.amount >= 0.75) warningStatus = 'WARNING_75';

      return {
        ...b,
        spent,
        remaining: Math.max(0, b.amount - spent),
        percentage,
        warningStatus,
        category,
      };
    });
  },
  createBudget: (data: { categoryId: string; amount: number; month: number; year: number }) => {
    const budgets = getTable<Budget>(KEYS.BUDGETS);
    const index = budgets.findIndex(b => b.categoryId === data.categoryId && b.month === data.month && b.year === data.year);
    
    if (index !== -1) {
      budgets[index].amount = data.amount;
      setTable(KEYS.BUDGETS, budgets);
      return budgets[index];
    }

    const newBudget: Budget = {
      id: `b-${Date.now()}`,
      userId: 'user-1',
      categoryId: data.categoryId,
      amount: data.amount,
      spent: 0,
      remaining: data.amount,
      percentage: 0,
      month: data.month,
      year: data.year,
      warningStatus: 'NORMAL',
      category: getTable<Category>(KEYS.CATEGORIES).find(c => c.id === data.categoryId)!,
    };
    budgets.push(newBudget);
    setTable(KEYS.BUDGETS, budgets);
    return newBudget;
  },
  deleteBudget: (id: string) => {
    const budgets = getTable<Budget>(KEYS.BUDGETS);
    const filtered = budgets.filter(b => b.id !== id);
    setTable(KEYS.BUDGETS, filtered);
    return { success: true };
  },

  // Bills
  getBills: () => {
    const bills = getTable<Bill>(KEYS.BILLS);
    const categories = getTable<Category>(KEYS.CATEGORIES);
    const now = new Date().getTime();

    return bills.map(b => {
      const category = categories.find(c => c.id === b.categoryId) || null;
      const isLate = !b.isPaid && new Date(b.dueDate).getTime() < now;
      return { ...b, category, isLate };
    });
  },
  createBill: (data: Omit<Bill, 'id' | 'userId'>) => {
    const bills = getTable<Bill>(KEYS.BILLS);
    const newBill: Bill = {
      ...data,
      id: `bill-${Date.now()}`,
      userId: 'user-1',
      isPaid: false,
    };
    bills.push(newBill);
    setTable(KEYS.BILLS, bills);
    return newBill;
  },
  toggleBillPaid: (id: string) => {
    const bills = getTable<Bill>(KEYS.BILLS);
    const index = bills.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Bill not found');
    bills[index].isPaid = !bills[index].isPaid;
    setTable(KEYS.BILLS, bills);
    return bills[index];
  },
  deleteBill: (id: string) => {
    const bills = getTable<Bill>(KEYS.BILLS);
    const filtered = bills.filter(b => b.id !== id);
    setTable(KEYS.BILLS, filtered);
    return { success: true };
  },

  // Goals
  getGoals: () => {
    const goals = getTable<SavingsGoal>(KEYS.GOALS);
    return goals.map(g => {
      const percentage = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
      return { ...g, percentage, isCompleted: g.currentAmount >= g.targetAmount };
    });
  },
  createGoal: (data: Omit<SavingsGoal, 'id' | 'userId' | 'isCompleted'>) => {
    const goals = getTable<SavingsGoal>(KEYS.GOALS);
    const newGoal: SavingsGoal = {
      ...data,
      id: `goal-${Date.now()}`,
      userId: 'user-1',
      isCompleted: data.currentAmount >= data.targetAmount,
    };
    goals.push(newGoal);
    setTable(KEYS.GOALS, goals);
    return newGoal;
  },
  contributeGoal: (id: string, amount: number) => {
    const goals = getTable<SavingsGoal>(KEYS.GOALS);
    const index = goals.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Goal not found');
    goals[index].currentAmount += amount;
    goals[index].isCompleted = goals[index].currentAmount >= goals[index].targetAmount;
    setTable(KEYS.GOALS, goals);
    return goals[index];
  },
  deleteGoal: (id: string) => {
    const goals = getTable<SavingsGoal>(KEYS.GOALS);
    const filtered = goals.filter(g => g.id !== id);
    setTable(KEYS.GOALS, filtered);
    return { success: true };
  },

  // Notifications
  getNotifications: () => getTable<Notification>(KEYS.NOTIFICATIONS),

  // Reports
  getDashboardSummary: () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const accounts = getTable<Account>(KEYS.ACCOUNTS);
    const bills = getTable<Bill>(KEYS.BILLS).filter(b => !b.isPaid).slice(0, 4);
    const goals = getTable<SavingsGoal>(KEYS.GOALS).slice(0, 3);
    const budgets = db.getBudgets(currentMonth, currentYear);

    // Get current month transactions
    const start = new Date(currentYear, currentMonth - 1, 1).getTime();
    const end = new Date(currentYear, currentMonth, 0, 23, 59, 59).getTime();

    const allTx = db.getTransactions();
    const monthTx = allTx.filter(t => {
      const txTime = new Date(t.date).getTime();
      return txTime >= start && txTime <= end;
    });

    const totalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);

    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    monthTx.forEach(t => {
      if (t.type === 'INCOME') monthlyIncome += t.amount;
      if (t.type === 'EXPENSE') monthlyExpenses += t.amount;
    });

    const savings = Math.max(0, monthlyIncome - monthlyExpenses);

    const budgetProgress = budgets.map(b => ({
      id: b.id,
      categoryName: b.category.name,
      color: b.category.color,
      amount: b.amount,
      spent: b.spent,
      percentage: b.percentage,
    }));

    return {
      summary: {
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        savings,
        spendingThisMonth: monthlyExpenses,
      },
      recentTransactions: allTx.slice(0, 5),
      upcomingBills: bills.map(b => ({
        ...b,
        category: getTable<Category>(KEYS.CATEGORIES).find(c => c.id === b.categoryId) || null,
        isLate: new Date(b.dueDate).getTime() < now.getTime(),
      })),
      budgetProgress,
      savingsGoals: goals.map(g => ({
        ...g,
        percentage: g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0,
      })),
    };
  },

  getCategorySpendingReport: (filters: { startDate?: string; endDate?: string } = {}) => {
    let tx = getTable<Transaction>(KEYS.TRANSACTIONS).filter(t => t.type === 'EXPENSE');
    const categories = getTable<Category>(KEYS.CATEGORIES);

    if (filters.startDate) {
      const start = new Date(filters.startDate).getTime();
      tx = tx.filter(t => new Date(t.date).getTime() >= start);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate).getTime();
      tx = tx.filter(t => new Date(t.date).getTime() <= end);
    }

    const categoryMap: Record<string, { name: string; color: string; value: number }> = {};
    let totalSpent = 0;

    tx.forEach(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      const catName = cat?.name || 'Uncategorized';
      const catColor = cat?.color || '#64748b';
      totalSpent += t.amount;

      if (!categoryMap[catName]) {
        categoryMap[catName] = { name: catName, color: catColor, value: 0 };
      }
      categoryMap[catName].value += t.amount;
    });

    const categoriesList = Object.values(categoryMap).map(cat => ({
      ...cat,
      value: Math.round(cat.value * 100) / 100,
      percentage: totalSpent > 0 ? Math.round((cat.value / totalSpent) * 100) : 0,
    }));

    return {
      totalSpent: Math.round(totalSpent * 100) / 100,
      categories: categoriesList,
    };
  },

  getMonthlyTrendsReport: (months: number = 6) => {
    const tx = getTable<Transaction>(KEYS.TRANSACTIONS);
    const now = new Date();
    const monthlyMap: Record<string, { month: string; income: number; expense: number; net: number }> = {};

    // Initialize list of months
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthlyMap[label] = { month: label, income: 0, expense: 0, net: 0 };
    }

    tx.forEach(t => {
      const label = new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (monthlyMap[label]) {
        if (t.type === 'INCOME') monthlyMap[label].income += t.amount;
        if (t.type === 'EXPENSE') monthlyMap[label].expense += t.amount;
        monthlyMap[label].net = monthlyMap[label].income - monthlyMap[label].expense;
      }
    });

    return {
      trends: Object.values(monthlyMap),
    };
  },

  exportCSV: () => {
    const tx = db.getTransactions();
    let csv = 'ID,Date,Type,Description,Amount,Category,Account,Payment Method,Tags\n';
    tx.forEach(t => {
      const catName = t.category?.name || '';
      const accName = t.account?.name || '';
      csv += `"${t.id}","${t.date}","${t.type}","${t.description.replace(/"/g, '""')}",${t.amount},"${catName}","${accName}","${t.paymentMethod}","${(t.tags || []).join('; ')}"\n`;
    });
    return csv;
  },

  exportBackup: () => {
    return {
      user: db.getCurrentUser(),
      accounts: db.getAccounts(),
      categories: db.getCategories(),
      transactions: getTable(KEYS.TRANSACTIONS),
      budgets: getTable(KEYS.BUDGETS),
      bills: getTable(KEYS.BILLS),
      goals: getTable(KEYS.GOALS),
      notifications: getTable(KEYS.NOTIFICATIONS),
    };
  },
};
