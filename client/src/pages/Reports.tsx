import React, { useEffect, useState } from 'react';
import { FileText, Download, TrendingUp, TrendingDown, PieChart as PieIcon, BarChart2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card } from '../components/ui/Card.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const Reports: React.FC = () => {
  const { user } = useAuth();
  const [trends, setTrends] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const [trendRes, catRes] = await Promise.all([
          api.get('/reports/monthly-trends?months=12'),
          api.get('/reports/category-spending'),
        ]);

        setTrends(trendRes.data.data.trends);
        setCategories(catRes.data.data.categories);
        setTotalSpent(catRes.data.data.totalSpent);
      } catch (err) {
        console.error('Failed to fetch reports', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export CSV', err);
    }
  };

  const handleExportJSON = async () => {
    try {
      const response = await api.get('/export/backup', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'expense_tracker_backup.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export JSON backup', err);
    }
  };

  const currencySymbol = user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : '$';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Financial Reports & Exports
          </h1>
          <p className="text-sm text-muted-foreground">
            Analyze cash flow trends, category distributions, and export raw data
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl border border-border/80 bg-muted/40 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-all"
          >
            <Download className="h-4 w-4 text-primary" />
            Export CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
          >
            <Download className="h-4 w-4" />
            Full Backup JSON
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Annual Cash Flow Bar Chart */}
          <Card>
            <div className="flex items-center justify-between pb-4 mb-2">
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Annual Cash Flow (12 Months)
                </h3>
                <p className="text-xs text-muted-foreground">Monthly breakdown of income and expenses</p>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Category Breakdown Table & Pie */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <h3 className="font-heading text-lg font-bold text-foreground pb-4 border-b border-border/40 mb-4">
                Expense Category Distribution
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categories.map((entry, index) => (
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
              </div>
            </Card>

            <Card className="p-0 overflow-hidden">
              <div className="p-4 border-b border-border/40 font-heading font-bold text-foreground">
                Detailed Category Summary (Total: {currencySymbol}{totalSpent.toFixed(2)})
              </div>
              <div className="divide-y divide-border/30 max-h-80 overflow-y-auto">
                {categories.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 text-sm">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-semibold text-foreground">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-foreground">
                        {currencySymbol}
                        {cat.value.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({cat.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
