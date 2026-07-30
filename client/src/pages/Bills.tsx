import React, { useEffect, useState } from 'react';
import { CalendarCheck, Plus, CheckCircle2, AlertCircle, Clock, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card.js';
import { Modal } from '../components/ui/Modal.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { Bill } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const Bills: React.FC = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [reminderDays, setReminderDays] = useState('3');
  const [notes, setNotes] = useState('');

  const fetchBills = async () => {
    try {
      const res = await api.get('/bills');
      setBills(res.data.data.bills);
    } catch (err) {
      console.error('Failed to fetch bills', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleTogglePaid = async (id: string) => {
    try {
      await api.patch(`/bills/${id}/paid`);
      fetchBills();
    } catch (err) {
      console.error('Failed to toggle bill paid status', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this bill reminder?')) return;
    try {
      await api.delete(`/bills/${id}`);
      fetchBills();
    } catch (err) {
      console.error('Failed to delete bill', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/bills', {
        name,
        amount: parseFloat(amount),
        dueDate,
        reminderDays: parseInt(reminderDays, 10),
        notes,
      });

      setIsModalOpen(false);
      setName('');
      setAmount('');
      fetchBills();
    } catch (err) {
      console.error('Failed to create bill', err);
    }
  };

  const currencySymbol = user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : '$';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Bills & Reminders
          </h1>
          <p className="text-sm text-muted-foreground">
            Track upcoming bills, due dates, late alerts, and payment receipts
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
        >
          <Plus className="h-5 w-5" />
          Add Bill
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : bills.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <p className="text-base font-semibold">No bills tracked.</p>
          <p className="text-xs mt-1">Add recurring bills to receive payment reminders.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {bills.map((bill) => (
            <Card
              key={bill.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 ${
                bill.isPaid
                  ? 'opacity-60 bg-muted/20'
                  : bill.isLate
                  ? 'border-destructive/40 bg-destructive/5'
                  : ''
              }`}
            >
              <div className="flex items-start sm:items-center gap-4">
                <button
                  onClick={() => handleTogglePaid(bill.id)}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    bill.isPaid
                      ? 'bg-success text-success-foreground'
                      : 'border border-border/80 text-muted-foreground hover:bg-muted'
                  }`}
                  title={bill.isPaid ? 'Mark unpaid' : 'Mark paid'}
                >
                  <CheckCircle2 className="h-6 w-6" />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      className={`font-heading text-base font-bold ${
                        bill.isPaid ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      {bill.name}
                    </h3>
                    {bill.isLate && !bill.isPaid && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive">
                        <AlertCircle className="h-3 w-3" /> LATE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="h-3.5 w-3.5" />
                    Due {new Date(bill.dueDate).toLocaleDateString()} • Reminder {bill.reminderDays} days before
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <span className="font-heading text-lg font-bold text-foreground">
                  {currencySymbol}
                  {bill.amount.toFixed(2)}
                </span>

                <button
                  onClick={() => handleDelete(bill.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Bill Reminder"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
              Bill Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Internet, Electricity, Gym..."
              className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Amount ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="79.99"
                className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm font-bold focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
              Reminder Days Before Due Date
            </label>
            <input
              type="number"
              value={reminderDays}
              onChange={(e) => setReminderDays(e.target.value)}
              placeholder="3"
              className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all mt-4"
          >
            Save Bill Reminder
          </button>
        </form>
      </Modal>
    </div>
  );
};
