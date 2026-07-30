export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  dateFormat: string;
  theme: string;
  language: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'CHECKING' | 'SAVINGS' | 'CASH' | 'CREDIT_CARD' | 'INVESTMENT';
  currentBalance: number;
  color: string;
  institution?: string | null;
  isDefault: boolean;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color: string;
  icon: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  account?: Account;
  toAccountId?: string | null;
  toAccount?: Account | null;
  categoryId?: string | null;
  category?: Category | null;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  date: string;
  description: string;
  paymentMethod: string;
  isRecurring: boolean;
  notes?: string | null;
  receiptUrl?: string | null;
  tags: string[];
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  category: Category;
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
  month: number;
  year: number;
  warningStatus: 'NORMAL' | 'WARNING_75' | 'WARNING_90' | 'EXCEEDED';
}

export interface Bill {
  id: string;
  userId: string;
  name: string;
  amount: number;
  dueDate: string;
  categoryId?: string | null;
  category?: Category | null;
  isPaid: boolean;
  isLate?: boolean;
  isRecurring: boolean;
  reminderDays: number;
  notes?: string | null;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | null;
  color: string;
  category: string;
  percentage?: number;
  isCompleted: boolean;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export interface DashboardSummary {
  summary: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savings: number;
    spendingThisMonth: number;
  };
  recentTransactions: Transaction[];
  upcomingBills: Bill[];
  budgetProgress: Array<{
    id: string;
    categoryName: string;
    color: string;
    amount: number;
    spent: number;
    percentage: number;
  }>;
  savingsGoals: SavingsGoal[];
}
