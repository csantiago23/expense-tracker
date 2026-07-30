import React, { useEffect, useState } from 'react';
import { PieChart as PieIcon, Plus, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card.js';
import { Modal } from '../components/ui/Modal.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { Budget, Category } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const Budgets: React.FC = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formAmount, setFormAmount] = useState('');

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const [budRes, catRes] = await Promise.all([
        api.get(`/budgets?month=${month}&year=${year}`),
        api.get('/categories'),
      ]);

      setBudgets(budRes.data.data.budgets);
      const expenseCategories = catRes.data.data.categories.filter((c: Category) => c.type === 'EXPENSE');
      setCategories(expenseCategories);

      if (expenseCategories.length > 0 && !formCategoryId) {
        setFormCategoryId(expenseCategories[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch budgets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/budgets', {
        categoryId: formCategoryId,
        amount: parseFloat(formAmount),
        month,
        year,
      });

      setIsModalOpen(false);
      setFormAmount('');
      fetchBudgets();
    } catch (err) {
      console.error('Failed to set budget', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this budget?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      fetchBudgets();
    } catch (err) {
      console.error('Failed to delete budget', err);
    }
  };

  const currencySymbol = user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : '$';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Monthly Budgets
          </h1>
          <p className="text-sm text-muted-foreground">
            Set spending limits and receive automatic warnings at 75%, 90%, and 100% capacity
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            className="rounded-xl border border-border/60 bg-muted/40 py-2 px-3 text-sm font-semibold focus:border-primary focus:outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
              <option key={m} value={m}>
                {new Date(2026, m - 1, 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
          >
            <Plus className="h-5 w-5" />
            Set Budget
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <p className="text-base font-semibold">No budgets configured for this month.</p>
          <p className="text-xs mt-1">Click "Set Budget" to create spending targets per category.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((b) => {
            const isExceeded = b.percentage >= 100;
            const isWarning90 = b.percentage >= 90 && b.percentage < 100;
            const isWarning75 = b.percentage >= 75 && b.percentage < 90;

            return (
              <Card key={b.id} className="relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold"
                      style={{ backgroundColor: b.category.color }}
                    >
                      <PieIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-base font-bold text-foreground">
                        {b.category.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">Monthly Target</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Progress</span>
                    <span
                      className={
                        isExceeded
                          ? 'text-destructive font-bold'
                          : isWarning90
                          ? 'text-warning font-bold'
                          : isWarning75
                          ? 'text-warning font-semibold'
                          : 'text-foreground'
                      }
                    >
                      {b.percentage}% Spent
                    </span>
                  </div>

                  <div className="h-3 w-full rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isExceeded
                          ? 'bg-destructive'
                          : isWarning90
                          ? 'bg-warning'
                          : isWarning75
                          ? 'bg-warning/80'
                          : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(100, b.percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Stats Footer */}
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-muted-foreground">Spent: </span>
                    <span className="font-bold text-foreground">
                      {currencySymbol}
                      {b.spent.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Limit: </span>
                    <span className="font-bold text-foreground">
                      {currencySymbol}
                      {b.amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Warning Alert Badge */}
                {isExceeded && (
                  <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-destructive/10 p-2 text-xs font-bold text-destructive">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Budget limit exceeded by {currencySymbol}{(b.spent - b.amount).toFixed(2)}!
                  </div>
                )}
                {isWarning90 && (
                  <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-warning/10 p-2 text-xs font-semibold text-warning">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Warning: 90% of budget reached!
                  </div>
                )}
                {isWarning75 && (
                  <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-warning/10 p-2 text-xs font-medium text-warning">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Notice: 75% of budget reached.
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Set Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Set Category Monthly Budget"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
              Category
            </label>
            <select
              value={formCategoryId}
              onChange={(e) => setFormCategoryId(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm focus:border-primary focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
              Monthly Budget Amount ({currencySymbol})
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              placeholder="500.00"
              className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm font-bold focus:border-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all mt-4"
          >
            Save Budget
          </button>
        </form>
      </Modal>
    </div>
  );
};
