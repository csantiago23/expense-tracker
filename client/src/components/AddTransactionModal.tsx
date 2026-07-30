import React, { useEffect, useState } from 'react';
import { Modal } from './ui/Modal.js';
import { Account, Category } from '../types/index.js';
import { api } from '../services/api.js';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [type, setType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError('');
      fetchOptions();
    }
  }, [isOpen]);

  const fetchOptions = async () => {
    try {
      const [accRes, catRes] = await Promise.all([api.get('/accounts'), api.get('/categories')]);
      const fetchedAccounts = accRes.data.data.accounts || [];
      const fetchedCategories = catRes.data.data.categories || [];

      setAccounts(fetchedAccounts);
      setCategories(fetchedCategories);

      if (fetchedAccounts.length > 0 && !accountId) {
        setAccountId(fetchedAccounts[0].id);
      }

      const defaultCategory = fetchedCategories.find((c: Category) => c.type === type);
      if (defaultCategory) {
        setCategoryId(defaultCategory.id);
      }
    } catch (err) {
      console.error('Failed to load accounts/categories for modal', err);
    }
  };

  const handleTypeChange = (newType: 'EXPENSE' | 'INCOME' | 'TRANSFER') => {
    setType(newType);
    const matchingCat = categories.find((c) => c.type === newType);
    setCategoryId(matchingCat ? matchingCat.id : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    if (!description.trim()) {
      setError('Description is required.');
      return;
    }
    if (!accountId) {
      setError('Please select an account.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('accountId', accountId);
      if (toAccountId) formData.append('toAccountId', toAccountId);
      if (categoryId) formData.append('categoryId', categoryId);
      formData.append('amount', amount);
      formData.append('date', date);
      formData.append('description', description);
      formData.append('paymentMethod', paymentMethod);
      if (notes) formData.append('notes', notes);

      const tagsArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      tagsArray.forEach((t) => formData.append('tags[]', t));

      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      // DO NOT set manual Content-Type header so Axios generates the boundary header!
      await api.post('/transactions', formData);

      // Reset form
      setAmount('');
      setDescription('');
      setNotes('');
      setTags('');
      setReceiptFile(null);
      setError('');

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Failed to add transaction', err);
      setError(err.response?.data?.message || 'Failed to create transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Transaction">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
            {error}
          </div>
        )}

        {/* Type Selector */}
        <div className="grid grid-cols-3 gap-2">
          {(['EXPENSE', 'INCOME', 'TRANSFER'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTypeChange(t)}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                type === t
                  ? t === 'EXPENSE'
                    ? 'bg-destructive text-destructive-foreground shadow-md'
                    : t === 'INCOME'
                    ? 'bg-success text-success-foreground shadow-md'
                    : 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Amount & Date */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm font-bold text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Description
          </label>
          <input
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Groceries, Salary, Coffee..."
            className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* Account & Category */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              {type === 'TRANSFER' ? 'From Account' : 'Account'}
            </label>
            <select
              required
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {type === 'TRANSFER' ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                To Account
              </label>
              <select
                required
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">Select Destination</option>
                {accounts
                  .filter((acc) => acc.id !== accountId)
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">Uncategorized</option>
                {categories
                  .filter((cat) => cat.type === type)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* Tags & Payment Method */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="Card">Credit/Debit Card</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Online">Online / PayPal</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Essential, Subscription"
              className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Receipt Attachment */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Receipt Attachment
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
            className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving Transaction...' : 'Save Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
