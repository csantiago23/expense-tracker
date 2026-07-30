import React, { useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, DollarSign, Calendar, Globe, Bell, Upload, Save, Check } from 'lucide-react';
import { Card } from '../components/ui/Card.js';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { api } from '../services/api.js';

export const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [dateFormat, setDateFormat] = useState(user?.dateFormat || 'MM/DD/YYYY');
  const [language, setLanguage] = useState(user?.language || 'en');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/profile', {
        name,
        currency,
        dateFormat,
        language,
        theme,
      });

      updateUser(res.data.data.user);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile settings', err);
    }
  };

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Application Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage currency preferences, visual themes, date formatting, and backup files
        </p>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/15 px-4 py-3 text-sm font-semibold text-success shadow-lg">
          <Check className="h-5 w-5" />
          Settings updated successfully!
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile & Currency Settings */}
        <Card className="space-y-4">
          <h3 className="font-heading text-lg font-bold text-foreground border-b border-border/40 pb-3">
            Profile & Currency Preferences
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Primary Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm focus:border-primary focus:outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Date Format
              </label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm focus:border-primary focus:outline-none"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 12/31/2026)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 31/12/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-12-31)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-muted/40 py-2.5 px-3 text-sm focus:border-primary focus:outline-none"
              >
                <option value="en">English (US)</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Theme Settings */}
        <Card className="space-y-4">
          <h3 className="font-heading text-lg font-bold text-foreground border-b border-border/40 pb-3">
            Appearance & Theme
          </h3>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`flex items-center justify-center gap-3 rounded-2xl border p-4 transition-all ${
                theme === 'dark'
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-md'
                  : 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted'
              }`}
            >
              <Moon className="h-5 w-5" />
              Dark Mode
            </button>

            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`flex items-center justify-center gap-3 rounded-2xl border p-4 transition-all ${
                theme === 'light'
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-md'
                  : 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted'
              }`}
            >
              <Sun className="h-5 w-5 text-warning" />
              Light Mode
            </button>
          </div>
        </Card>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
        >
          <Save className="h-5 w-5" />
          Save Changes
        </button>
      </form>
    </div>
  );
};
