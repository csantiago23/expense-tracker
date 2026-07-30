import React, { useEffect, useState } from 'react';
import { Target, Plus, PiggyBank, Trash2, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card.js';
import { Modal } from '../components/ui/Modal.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { SavingsGoal } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const Goals: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  // Add goal modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState('#10b981');
  const [category, setCategory] = useState('General');

  // Deposit modal
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data.data.goals);
    } catch (err) {
      console.error('Failed to fetch savings goals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/goals', {
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount) || 0,
        deadline: deadline || null,
        color,
        category,
      });

      setIsModalOpen(false);
      setName('');
      setTargetAmount('');
      fetchGoals();
    } catch (err) {
      console.error('Failed to create goal', err);
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;

    try {
      await api.post(`/goals/${selectedGoal.id}/contribute`, {
        amount: parseFloat(depositAmount),
      });

      setIsDepositOpen(false);
      setDepositAmount('');
      fetchGoals();
    } catch (err) {
      console.error('Failed to contribute to goal', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this savings goal?')) return;
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    } catch (err) {
      console.error('Failed to delete goal', err);
    }
  };

  const currencySymbol = user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : '$';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Savings Goals
          </h1>
          <p className="text-sm text-muted-foreground">
            Track progress towards your target savings and financial milestones
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
        >
          <Plus className="h-5 w-5" />
          Create Goal
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <p className="text-base font-semibold">No savings goals set.</p>
          <p className="text-xs mt-1">Start tracking your emergency fund, vacation, or big purchase targets.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const percentage = goal.percentage || 0;
            return (
              <Card key={goal.id} className="relative overflow-hidden group flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold"
                        style={{ backgroundColor: goal.color }}
                      >
                        <Target className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-heading text-base font-bold text-foreground">
                          {goal.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">{goal.category}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground font-bold">{percentage}%</span>
                    </div>

                    <div className="h-3 w-full rounded-full bg-muted/60 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: goal.color,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-muted-foreground">Saved: </span>
                      <span className="font-bold text-foreground">
                        {currencySymbol}
                        {goal.currentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target: </span>
                      <span className="font-bold text-foreground">
                        {currencySymbol}
                        {goal.targetAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-border/40 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {goal.deadline
                      ? `Deadline: ${new Date(goal.deadline).toLocaleDateString()}`
                      : 'No deadline'}
                  </span>

                  <button
                    onClick={() => {
                      setSelectedGoal(goal);
                      setIsDepositOpen(true);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
                  >
                    <PiggyBank className="h-4 w-4" />
                    Deposit
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Goal Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Savings Goal">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
              Goal Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Emergency Fund, Japan Trip..."
              className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Target Amount ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="5000.00"
                className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm font-bold focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Initial Amount ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Accent Color
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 rounded-xl border border-border/60 bg-muted/40 p-1 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all mt-4"
          >
            Create Goal
          </button>
        </form>
      </Modal>

      {/* Deposit Modal */}
      <Modal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        title={`Add Deposit to "${selectedGoal?.name}"`}
      >
        <form onSubmit={handleDepositSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
              Deposit Amount ({currencySymbol})
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="100.00"
              className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm font-bold focus:border-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all mt-4"
          >
            Confirm Deposit
          </button>
        </form>
      </Modal>
    </div>
  );
};
