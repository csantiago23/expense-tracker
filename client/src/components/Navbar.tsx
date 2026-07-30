import React, { useState, useEffect } from 'react';
import { Menu, Sun, Moon, Bell, Search, Plus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

interface NavbarProps {
  onMenuToggle: () => void;
  onQuickAdd?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, onQuickAdd }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setUnreadCount(res.data.data.unreadCount || 0);
      } catch (err) {
        // silent
      }
    };
    fetchNotifications();
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/40 bg-card/80 px-4 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Global Search Quick Indicator */}
        <div className="relative hidden md:block w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Global Search (Press '/' to search)..."
            className="w-full rounded-xl border border-border/60 bg-muted/40 py-2 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Add Action Button */}
        {onQuickAdd && (
          <button
            onClick={onQuickAdd}
            className="flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Transaction</span>
          </button>
        )}

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-xl border border-border/40 bg-muted/30 p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-warning" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button
            className="rounded-xl border border-border/40 bg-muted/30 p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Currency Indicator */}
        <div className="hidden sm:flex items-center gap-1 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary border border-primary/20">
          <span>Currency:</span>
          <span className="font-bold">{user?.currency || 'USD'}</span>
        </div>
      </div>
    </header>
  );
};
