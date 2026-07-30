import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';

import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { AddTransactionModal } from './components/AddTransactionModal.js';

import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';
import { Dashboard } from './pages/Dashboard.js';
import { Transactions } from './pages/Transactions.js';
import { Accounts } from './pages/Accounts.js';
import { Categories } from './pages/Categories.js';
import { Budgets } from './pages/Budgets.js';
import { Bills } from './pages/Bills.js';
import { Goals } from './pages/Goals.js';
import { Reports } from './pages/Reports.js';
import { Settings } from './pages/Settings.js';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-muted-foreground">Loading Expense Tracker...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleTxCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden min-w-0">
        <Navbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onQuickAdd={() => setIsAddTxModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard key={refreshKey} onQuickAdd={() => setIsAddTxModalOpen(true)} />
              }
            />
            <Route
              path="/transactions"
              element={
                <Transactions
                  quickAddOpen={isAddTxModalOpen}
                  onQuickAddClose={() => setIsAddTxModalOpen(false)}
                />
              }
            />
            <Route path="/accounts" element={<Accounts key={refreshKey} />} />
            <Route path="/categories" element={<Categories key={refreshKey} />} />
            <Route path="/budgets" element={<Budgets key={refreshKey} />} />
            <Route path="/bills" element={<Bills key={refreshKey} />} />
            <Route path="/goals" element={<Goals key={refreshKey} />} />
            <Route path="/reports" element={<Reports key={refreshKey} />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddTxModalOpen}
        onClose={() => setIsAddTxModalOpen(false)}
        onSuccess={handleTxCreated}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
};
