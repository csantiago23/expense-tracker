import React, { useEffect, useState } from 'react';
import { Wallet, Plus, CreditCard, Building, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card.js';
import { Modal } from '../components/ui/Modal.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { Account } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const Accounts: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<'CHECKING' | 'SAVINGS' | 'CASH' | 'CREDIT_CARD' | 'INVESTMENT'>('CHECKING');
  const [currentBalance, setCurrentBalance] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [institution, setInstitution] = useState('');

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/accounts');
      setAccounts(res.data.data.accounts);
    } catch (err) {
      console.error('Failed to fetch accounts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingAccount(null);
    setName('');
    setType('CHECKING');
    setCurrentBalance('0');
    setColor('#3b82f6');
    setInstitution('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (acc: Account) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setCurrentBalance(acc.currentBalance.toString());
    setColor(acc.color);
    setInstitution(acc.institution || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        type,
        currentBalance: parseFloat(currentBalance) || 0,
        color,
        institution,
      };

      if (editingAccount) {
        await api.put(`/accounts/${editingAccount.id}`, payload);
      } else {
        await api.post('/accounts', payload);
      }

      setIsModalOpen(false);
      fetchAccounts();
    } catch (err) {
      console.error('Failed to save account', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      await api.delete(`/accounts/${id}`);
      fetchAccounts();
    } catch (err) {
      console.error('Failed to delete account', err);
    }
  };

  const currencySymbol = user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : '$';
  const totalBalance = accounts.reduce((acc, a) => acc + a.currentBalance, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Accounts
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your bank accounts, credit cards, investments, and cash holdings
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
        >
          <Plus className="h-5 w-5" />
          Add Account
        </button>
      </div>

      {/* Net Balance Banner */}
      <Card className="bg-primary/10 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Total Net Balance Across All Accounts
            </span>
            <p className="font-heading text-3xl font-extrabold text-foreground mt-1">
              {currencySymbol}
              {totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Wallet className="h-6 w-6" />
          </div>
        </div>
      </Card>

      {/* Accounts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((acc) => (
            <Card key={acc.id} className="relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold"
                    style={{ backgroundColor: acc.color }}
                  >
                    {acc.type === 'CREDIT_CARD' ? (
                      <CreditCard className="h-5 w-5" />
                    ) : (
                      <Building className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-foreground">{acc.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {acc.institution || acc.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEditModal(acc)}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(acc.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Current Balance</span>
                <span
                  className={`font-heading text-xl font-bold ${
                    acc.currentBalance < 0 ? 'text-destructive' : 'text-foreground'
                  }`}
                >
                  {currencySymbol}
                  {acc.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Account Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAccount ? 'Edit Account' : 'Add New Account'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
              Account Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Checking, Sapphire Card..."
              className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Account Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm focus:border-primary focus:outline-none"
              >
                <option value="CHECKING">Checking</option>
                <option value="SAVINGS">Savings</option>
                <option value="CASH">Cash</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="INVESTMENT">Investment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Current Balance ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm font-bold focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Institution
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Chase, Ally, Fidelity..."
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
            {editingAccount ? 'Update Account' : 'Create Account'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
