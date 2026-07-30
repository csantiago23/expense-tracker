import React, { useEffect, useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  CalendarCheck,
  Target,
  PieChart as PieIcon,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Card } from '../components/ui/Card.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { DashboardSummary } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

interface DashboardProps {
  onQuickAdd: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onQuickAdd }) => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, trendRes, catRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/reports/monthly-trends?months=6'),
          api.get('/reports/category-spending'),
        ]);

        setData(dashRes.data.data);
        setTrends(trendRes.data.data.trends);
        setCategoryData(catRes.data.data.categories);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const currencySymbol = user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : '$';

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { summary, recentTransactions = [], upcomingBills = [], budgetProgress = [], savingsGoals = [] } =
    data || {};

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Financial Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Overview of your balances, cash flow, and financial progress
          </p>
        </div>

        <button
          onClick={onQuickAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
        >
          <Plus className="h-5 w-5" />
          Add Transaction
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Balance */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Balance
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
              {currencySymbol}
              {summary?.totalBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
            </p>
            <p className="mt-1 flex items-center text-xs text-success font-medium">
              <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />
              Active Across All Accounts
            </p>
          </div>
        </Card>

        {/* Monthly Income */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Monthly Income
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/20 text-success">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
              {currencySymbol}
              {summary?.monthlyIncome?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
            </p>
            <p className="mt-1 flex items-center text-xs text-success font-medium">
              <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />
              This Month
            </p>
          </div>
        </Card>

        {/* Monthly Expenses */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Monthly Expenses
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/20 text-destructive">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
              {currencySymbol}
              {summary?.monthlyExpenses?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
            </p>
            <p className="mt-1 flex items-center text-xs text-destructive font-medium">
              <ArrowDownRight className="mr-0.5 h-3.5 w-3.5" />
              This Month
            </p>
          </div>
        </Card>

        {/* Net Savings */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Net Savings
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <PiggyBank className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
              {currencySymbol}
              {summary?.savings?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground font-medium">
              Income minus Expenses
            </p>
          </div>
        </Card>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Income vs Expenses Trend Area Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between pb-4 mb-2">
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground">
                Income vs Expenses Trend
              </h3>
              <p className="text-xs text-muted-foreground">Past 6 months comparison</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#incomeGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#expenseGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown Pie Chart */}
        <Card>
          <div className="flex items-center justify-between pb-4 mb-2">
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground">
                Category Spending
              </h3>
              <p className="text-xs text-muted-foreground">Expense distribution</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {categoryData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No expense data recorded yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Legend preview */}
          <div className="mt-2 space-y-1 max-h-24 overflow-y-auto pr-1">
            {categoryData.slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-muted-foreground truncate">{c.name}</span>
                </div>
                <span className="font-semibold text-foreground">
                  {currencySymbol}
                  {c.value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Grid for Widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Transactions Widget */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              <h3 className="font-heading text-lg font-bold text-foreground">
                Recent Transactions
              </h3>
            </div>
            <a
              href="/transactions"
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              View All <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          <div className="divide-y divide-border/30">
            {recentTransactions.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                No recent transactions found.
              </p>
            ) : (
              recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold"
                      style={{ backgroundColor: t.category?.color || '#64748b' }}
                    >
                      {t.description[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.category?.name || 'Uncategorized'} • {new Date(t.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      t.type === 'INCOME'
                        ? 'text-success'
                        : t.type === 'EXPENSE'
                        ? 'text-foreground'
                        : 'text-primary'
                    }`}
                  >
                    {t.type === 'INCOME' ? '+' : t.type === 'EXPENSE' ? '-' : ''}
                    {currencySymbol}
                    {t.amount.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Budget Progress & Upcoming Bills Widgets */}
        <div className="space-y-6">
          {/* Budget Progress */}
          <Card>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <PieIcon className="h-5 w-5 text-warning" />
                <h3 className="font-heading text-md font-bold text-foreground">
                  Budget Progress
                </h3>
              </div>
              <a href="/budgets" className="text-xs text-primary hover:underline font-semibold">
                Manage
              </a>
            </div>

            <div className="space-y-4">
              {budgetProgress.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2 text-center">
                  No monthly budgets set.
                </p>
              ) : (
                budgetProgress.slice(0, 3).map((b) => (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{b.categoryName}</span>
                      <span className="text-muted-foreground font-semibold">
                        {currencySymbol}
                        {b.spent.toFixed(0)} / {currencySymbol}
                        {b.amount.toFixed(0)} ({b.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          b.percentage >= 100
                            ? 'bg-destructive'
                            : b.percentage >= 90
                            ? 'bg-warning'
                            : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Upcoming Bills */}
          <Card>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-destructive" />
                <h3 className="font-heading text-md font-bold text-foreground">
                  Upcoming Bills
                </h3>
              </div>
              <a href="/bills" className="text-xs text-primary hover:underline font-semibold">
                View All
              </a>
            </div>

            <div className="space-y-3">
              {upcomingBills.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2 text-center">
                  No pending bills.
                </p>
              ) : (
                upcomingBills.slice(0, 3).map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-foreground">{bill.name}</p>
                      <p className="text-muted-foreground">
                        Due {new Date(bill.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-bold text-destructive">
                      {currencySymbol}
                      {bill.amount.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
