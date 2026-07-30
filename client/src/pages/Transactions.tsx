import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  Trash2,
  Edit2,
  Paperclip,
  RotateCcw,
  ArrowUpDown,
  Tag as TagIcon,
  X,
  FileImage,
} from 'lucide-react';
import { Card } from '../components/ui/Card.js';
import { Modal } from '../components/ui/Modal.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { Transaction, Account, Category } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

interface TransactionsProps {
  quickAddOpen?: boolean;
  onQuickAddClose?: () => void;
}

export const Transactions: React.FC<TransactionsProps> = ({
  quickAddOpen = false,
  onQuickAddClose,
}) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Pagination & Sort states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(quickAddOpen);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [formType, setFormType] = useState<'INCOME' | 'EXPENSE' | 'TRANSFER'>('EXPENSE');
  const [formAccountId, setFormAccountId] = useState('');
  const [formToAccountId, setFormToAccountId] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDescription, setFormDescription] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState('Card');
  const [formNotes, setFormNotes] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formReceiptFile, setFormReceiptFile] = useState<File | null>(null);

  // Undo delete notification state
  const [lastDeleted, setLastDeleted] = useState<Transaction | null>(null);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (quickAddOpen) setIsModalOpen(true);
  }, [quickAddOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 20,
        sortBy,
        sortOrder,
      };
      if (search) params.search = search;
      if (selectedType) params.type = selectedType;
      if (selectedAccount) params.accountId = selectedAccount;
      if (selectedCategory) params.categoryId = selectedCategory;

      const [txRes, accRes, catRes] = await Promise.all([
        api.get('/transactions', { params }),
        api.get('/accounts'),
        api.get('/categories'),
      ]);

      setTransactions(txRes.data.data.transactions);
      setTotalPages(txRes.data.data.pagination.totalPages || 1);
      setAccounts(accRes.data.data.accounts);
      setCategories(catRes.data.data.categories);

      if (accRes.data.data.accounts.length > 0 && !formAccountId) {
        setFormAccountId(accRes.data.data.accounts[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, sortBy, sortOrder, search, selectedType, selectedAccount, selectedCategory]);

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setFormType('EXPENSE');
    setFormAmount('');
    setFormDescription('');
    setFormNotes('');
    setFormTags('');
    setFormReceiptFile(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    if (accounts.length > 0) setFormAccountId(accounts[0].id);
    if (categories.length > 0) setFormCategoryId(categories[0].id);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: Transaction) => {
    setEditingTransaction(t);
    setFormType(t.type);
    setFormAccountId(t.accountId);
    setFormToAccountId(t.toAccountId || '');
    setFormCategoryId(t.categoryId || '');
    setFormAmount(t.amount.toString());
    setFormDate(t.date.split('T')[0]);
    setFormDescription(t.description);
    setFormPaymentMethod(t.paymentMethod || 'Card');
    setFormNotes(t.notes || '');
    setFormTags(t.tags ? t.tags.join(', ') : '');
    setFormReceiptFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (onQuickAddClose) onQuickAddClose();
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('type', formType);
      formData.append('accountId', formAccountId);
      if (formToAccountId) formData.append('toAccountId', formToAccountId);
      if (formCategoryId) formData.append('categoryId', formCategoryId);
      formData.append('amount', formAmount);
      formData.append('date', formDate);
      formData.append('description', formDescription);
      formData.append('paymentMethod', formPaymentMethod);
      if (formNotes) formData.append('notes', formNotes);

      const tagsArray = formTags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      tagsArray.forEach((tag) => formData.append('tags[]', tag));

      if (formReceiptFile) {
        formData.append('receipt', formReceiptFile);
      }

      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction.id}`, formData);
      } else {
        await api.post('/transactions', formData);
      }

      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error('Failed to save transaction', err);
    }
  };

  const handleDelete = async (t: Transaction) => {
    try {
      await api.delete(`/transactions/${t.id}`);
      setLastDeleted(t);
      if (undoTimeout) clearTimeout(undoTimeout);

      const timeout = setTimeout(() => {
        setLastDeleted(null);
      }, 6000);
      setUndoTimeout(timeout);

      fetchData();
    } catch (err) {
      console.error('Failed to delete transaction', err);
    }
  };

  const handleUndoDelete = async () => {
    if (!lastDeleted) return;
    try {
      const formData = new FormData();
      formData.append('type', lastDeleted.type);
      formData.append('accountId', lastDeleted.accountId);
      if (lastDeleted.toAccountId) formData.append('toAccountId', lastDeleted.toAccountId);
      if (lastDeleted.categoryId) formData.append('categoryId', lastDeleted.categoryId);
      formData.append('amount', lastDeleted.amount.toString());
      formData.append('date', lastDeleted.date);
      formData.append('description', lastDeleted.description);
      formData.append('paymentMethod', lastDeleted.paymentMethod);
      if (lastDeleted.notes) formData.append('notes', lastDeleted.notes);

      await api.post('/transactions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setLastDeleted(null);
      fetchData();
    } catch (err) {
      console.error('Failed to undo transaction deletion', err);
    }
  };

  const currencySymbol = user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : '$';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Transactions
          </h1>
          <p className="text-sm text-muted-foreground">
            View, search, filter, and manage your income and expenses
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
        >
          <Plus className="h-5 w-5" />
          Add Transaction
        </button>
      </div>

      {/* Undo Delete Notification Toast */}
      {lastDeleted && (
        <div className="flex items-center justify-between rounded-xl border border-warning/40 bg-warning/15 px-4 py-3 text-sm text-foreground shadow-lg animate-fadeIn">
          <span>Deleted transaction "{lastDeleted.description}" ({currencySymbol}{lastDeleted.amount.toFixed(2)})</span>
          <button
            onClick={handleUndoDelete}
            className="flex items-center gap-1.5 font-bold text-primary hover:underline"
          >
            <RotateCcw className="h-4 w-4" />
            Undo
          </button>
        </div>
      )}

      {/* Filter Toolbar Card */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search description, notes, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-muted/40 py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-muted/40 py-2 px-3 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
            <option value="TRANSFER">Transfer</option>
          </select>

          {/* Account Filter */}
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-muted/40 py-2 px-3 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-muted/40 py-2 px-3 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Transactions Data Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p className="text-base font-semibold">No transactions found.</p>
            <p className="text-xs mt-1">Try adjusting your search or filter parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/40 bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold">Description</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Account</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Amount</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Receipt</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      <div className="flex flex-col">
                        <span>{t.description}</span>
                        {t.tags && t.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            {t.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {t.category ? (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                          style={{
                            backgroundColor: `${t.category.color}20`,
                            color: t.category.color,
                          }}
                        >
                          {t.category.name}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Uncategorized</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground font-medium">
                      {t.account?.name || '-'}
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right font-bold whitespace-nowrap ${
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
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {t.receiptUrl ? (
                        <a
                          href={`http://localhost:5001${t.receiptUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="View Receipt"
                        >
                          <Paperclip className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(t)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/40 px-4 py-3">
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-border/60 px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-border/60 px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Add / Edit Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          {/* Type Selector */}
          <div className="grid grid-cols-3 gap-2">
            {(['EXPENSE', 'INCOME', 'TRANSFER'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFormType(t)}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  formType === t
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
                Amount ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
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
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
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
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Groceries, Salary, Coffee..."
              className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Account & Category */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                {formType === 'TRANSFER' ? 'From Account' : 'Account'}
              </label>
              <select
                required
                value={formAccountId}
                onChange={(e) => setFormAccountId(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            {formType === 'TRANSFER' ? (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  To Account
                </label>
                <select
                  required
                  value={formToAccountId}
                  onChange={(e) => setFormToAccountId(e.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Select Destination</option>
                  {accounts
                    .filter((acc) => acc.id !== formAccountId)
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
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Uncategorized</option>
                  {categories
                    .filter((cat) => cat.type === formType)
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
                value={formPaymentMethod}
                onChange={(e) => setFormPaymentMethod(e.target.value)}
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
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="Essential, Subscription"
                className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Receipt Attachment
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFormReceiptFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
            >
              {editingTransaction ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
