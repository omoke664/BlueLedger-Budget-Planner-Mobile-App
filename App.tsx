import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { LoginScreen } from './components/screens/LoginScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { TransactionsScreen } from './components/screens/TransactionsScreen';
import { AddEditTransactionScreen } from './components/screens/AddEditTransactionScreen';
import { AnalyticsScreen } from './components/screens/AnalyticsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { BudgetScreen } from './components/screens/BudgetScreen';
import { DashboardSkeleton, TransactionsSkeleton, AnalyticsSkeleton } from './components/SkeletonLoaders';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { auth, api } from './utils/supabase/client';

type Screen = 
  | 'login' 
  | 'dashboard' 
  | 'transactions' 
  | 'add-transaction' 
  | 'edit-transaction' 
  | 'analytics' 
  | 'settings'
  | 'budget';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description: string;
  notes?: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [editingTransactionData, setEditingTransactionData] = useState<Transaction | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshTransactions, setRefreshTransactions] = useState(0);

  // Check for existing session on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const session = await auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        setCurrentScreen('dashboard');
        await loadUserData();
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async () => {
    setIsDataLoading(true);
    try {
      const [profileResponse, transactionsResponse] = await Promise.all([
        api.getProfile(),
        api.getTransactions()
      ]);

      setUserData(profileResponse.profile);
      setTransactions(transactionsResponse.transactions);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleLogin = async (user: any) => {
    setIsLoggedIn(true);
    setCurrentScreen('dashboard');
    await loadUserData();
    toast.success('Welcome back to BlueLedger!');
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setIsLoggedIn(false);
      setCurrentScreen('login');
      setUserData(null);
      setTransactions([]);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  const handleAddTransaction = () => {
    setEditingTransactionId(null);
    setEditingTransactionData(null);
    setCurrentScreen('add-transaction');
  };

  const handleEditTransaction = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    setEditingTransactionId(transactionId);
    setEditingTransactionData(transaction || null);
    setCurrentScreen('edit-transaction');
  };

  const handleSaveTransaction = async (transactionData: any) => {
    try {
      if (editingTransactionId) {
        // Update existing transaction
        await api.updateTransaction(editingTransactionId, transactionData);
        toast.success('Transaction updated successfully!');
      } else {
        // Create new transaction
        await api.createTransaction(transactionData);
        toast.success('Transaction added successfully!');
      }
      
      // Refresh transactions list
      const response = await api.getTransactions();
      setTransactions(response.transactions);
      setCurrentScreen('dashboard');
    } catch (error: any) {
      console.error('Save transaction error:', error);
      toast.error(error.message || 'Failed to save transaction');
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await api.deleteTransaction(transactionId);
      
      // Refresh transactions list
      const response = await api.getTransactions();
      setTransactions(response.transactions);
      toast.success('Transaction deleted successfully!');
      
      // Haptic feedback simulation
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    } catch (error: any) {
      console.error('Delete transaction error:', error);
      toast.error(error.message || 'Failed to delete transaction');
    }
  };

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading BlueLedger...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  const renderCurrentScreen = () => {
    if (!isLoggedIn) {
      return <LoginScreen onLogin={handleLogin} />;
    }

    // Show skeleton loaders while data is loading
    if (!userData || isDataLoading) {
      switch (currentScreen) {
        case 'transactions':
          return <TransactionsSkeleton />;
        case 'analytics':
          return <AnalyticsSkeleton />;
        default:
          return <DashboardSkeleton />;
      }
    }

    switch (currentScreen) {
      case 'dashboard':
        return (
          <DashboardScreen 
            userName={userData.name}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onNavigateToAnalytics={() => navigateTo('analytics')}
            onNavigateToBudget={() => navigateTo('budget')}
            onRefresh={loadUserData}
          />
        );
      
      case 'transactions':
        return (
          <TransactionsScreen 
            transactions={transactions}
            onBack={() => navigateTo('dashboard')}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onRefresh={loadUserData}
          />
        );
      
      case 'add-transaction':
      case 'edit-transaction':
        return (
          <AddEditTransactionScreen 
            onBack={() => navigateTo('dashboard')}
            onSave={handleSaveTransaction}
            editingTransaction={editingTransactionData}
          />
        );
      
      case 'analytics':
        return (
          <AnalyticsScreen 
            transactions={transactions}
            onBack={() => navigateTo('dashboard')}
            onRefresh={loadUserData}
          />
        );

      case 'budget':
        return (
          <BudgetScreen 
            onBack={() => navigateTo('dashboard')}
            transactions={transactions}
          />
        );
      
      case 'settings':
        return (
          <SettingsScreen 
            onBack={() => navigateTo('dashboard')}
            onLogout={handleLogout}
            userData={userData}
            onUpdateProfile={loadUserData}
          />
        );
      
      default:
        return (
          <DashboardScreen 
            userName={userData.name}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onNavigateToAnalytics={() => navigateTo('analytics')}
            onNavigateToBudget={() => navigateTo('budget')}
            onRefresh={loadUserData}
          />
        );
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        {renderCurrentScreen()}
        
        {/* Bottom Navigation - Only show when logged in and not on certain screens */}
        {isLoggedIn && !['add-transaction', 'edit-transaction'].includes(currentScreen) && (
          <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-padding-bottom">
            <div className="flex items-center justify-around p-2">
              <button
                onClick={() => navigateTo('dashboard')}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors min-w-0 ${
                  currentScreen === 'dashboard' 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="w-6 h-6 mb-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="7" height="9" x="3" y="3" rx="1"/>
                    <rect width="7" height="5" x="14" y="3" rx="1"/>
                    <rect width="7" height="9" x="14" y="12" rx="1"/>
                    <rect width="7" height="5" x="3" y="16" rx="1"/>
                  </svg>
                </div>
                <span className="caption">Home</span>
              </button>

              <button
                onClick={() => navigateTo('transactions')}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors min-w-0 ${
                  currentScreen === 'transactions' 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="w-6 h-6 mb-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                </div>
                <span className="caption">Transactions</span>
              </button>

              <button
                onClick={() => navigateTo('budget')}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors min-w-0 ${
                  currentScreen === 'budget' 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="w-6 h-6 mb-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                </div>
                <span className="caption">Budget</span>
              </button>

              <button
                onClick={() => navigateTo('analytics')}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors min-w-0 ${
                  currentScreen === 'analytics' 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="w-6 h-6 mb-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18"/>
                    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                  </svg>
                </div>
                <span className="caption">Analytics</span>
              </button>

              <button
                onClick={() => navigateTo('settings')}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors min-w-0 ${
                  currentScreen === 'settings' 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="w-6 h-6 mb-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <span className="caption">Settings</span>
              </button>
            </div>
          </div>
        )}
        
        <Toaster />
      </div>
    </ThemeProvider>
  );
}