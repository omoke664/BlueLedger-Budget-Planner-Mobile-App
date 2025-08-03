import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Switch } from '../ui/switch';
import { useTheme } from '../ThemeProvider';
import { ArrowLeft, User, Bell, Shield, Moon, Sun, Save } from 'lucide-react';
import { api } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
  onUpdateProfile: () => void;
}

export function SettingsScreen({ onBack, onLogout, userData, onUpdateProfile }: SettingsScreenProps) {
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: userData?.name || '',
    email: userData?.email || ''
  });
  const [budgetTargets, setBudgetTargets] = useState<Record<string, number>>({});
  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    monthlyReports: true,
    transactionReminders: false
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [budgetsResponse, preferencesResponse] = await Promise.all([
        api.getBudgets(),
        api.getPreferences()
      ]);

      setBudgetTargets(budgetsResponse.budgets || {
        'Food & Dining': 800,
        'Transportation': 600,
        'Shopping': 400,
        'Entertainment': 300,
        'Bills & Utilities': 1000
      });

      if (preferencesResponse.preferences?.notifications) {
        setNotifications(preferencesResponse.preferences.notifications);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profileData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsLoading(true);
    try {
      await api.updateProfile(profileData);
      await onUpdateProfile();
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBudgetChange = (category: string, value: string) => {
    setBudgetTargets(prev => ({
      ...prev,
      [category]: parseFloat(value) || 0
    }));
  };

  const handleSaveBudgets = async () => {
    setIsLoading(true);
    try {
      await api.updateBudgets(budgetTargets);
      toast.success('Budget targets updated successfully!');
    } catch (error: any) {
      console.error('Update budgets error:', error);
      toast.error(error.message || 'Failed to update budget targets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNotifications = async (key: string, value: boolean) => {
    const updatedNotifications = { ...notifications, [key]: value };
    setNotifications(updatedNotifications);

    try {
      await api.updatePreferences({
        theme,
        notifications: updatedNotifications
      });
      toast.success('Notification preferences updated!');
    } catch (error: any) {
      console.error('Update notifications error:', error);
      toast.error('Failed to update notifications');
    }
  };

  const handleThemeToggle = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    toggleTheme();

    try {
      await api.updatePreferences({
        theme: newTheme,
        notifications
      });
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-grid-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-medium">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-grid-3 space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="p-grid-4">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {profileData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{profileData.name}</h3>
                <p className="caption text-muted-foreground">{profileData.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input 
                  id="display-name" 
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={isLoading}
                />
              </div>
              <Button 
                onClick={handleUpdateProfile} 
                disabled={isLoading}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-grid-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="theme-switch">Dark Mode</Label>
                <p className="caption text-muted-foreground mt-1">
                  Switch between light and dark theme
                </p>
              </div>
              <Switch 
                id="theme-switch"
                checked={theme === 'dark'}
                onCheckedChange={handleThemeToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget Targets */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Budget Targets</CardTitle>
              <Button 
                onClick={handleSaveBudgets} 
                disabled={isLoading}
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-grid-4">
            <div className="space-y-4">
              {Object.entries(budgetTargets).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <Label className="flex-1">{category}</Label>
                  <div className="flex items-center gap-2">
                    <span className="caption text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => handleBudgetChange(category, e.target.value)}
                      className="w-24 text-right"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-grid-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="budget-alerts">Budget Alerts</Label>
                  <p className="caption text-muted-foreground mt-1">
                    Get notified when you exceed budget limits
                  </p>
                </div>
                <Switch 
                  id="budget-alerts"
                  checked={notifications.budgetAlerts}
                  onCheckedChange={(checked) => handleUpdateNotifications('budgetAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="monthly-reports">Monthly Reports</Label>
                  <p className="caption text-muted-foreground mt-1">
                    Receive monthly spending summaries
                  </p>
                </div>
                <Switch 
                  id="monthly-reports"
                  checked={notifications.monthlyReports}
                  onCheckedChange={(checked) => handleUpdateNotifications('monthlyReports', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="transaction-reminders">Transaction Reminders</Label>
                  <p className="caption text-muted-foreground mt-1">
                    Reminders to log daily transactions
                  </p>
                </div>
                <Switch 
                  id="transaction-reminders"
                  checked={notifications.transactionReminders}
                  onCheckedChange={(checked) => handleUpdateNotifications('transactionReminders', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="p-grid-4">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" disabled>
                Change Password
                <span className="ml-auto caption text-muted-foreground">Coming Soon</span>
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                Enable Two-Factor Authentication
                <span className="ml-auto caption text-muted-foreground">Coming Soon</span>
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                Export Data
                <span className="ml-auto caption text-muted-foreground">Coming Soon</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <div className="pb-6">
          <Button variant="destructive" className="w-full" onClick={onLogout}>
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}