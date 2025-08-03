import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { KPICard } from '../KPICard';
import { FloatingActionButton } from '../FloatingActionButton';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { PullToRefresh } from '../PullToRefresh';
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3, ArrowRight, Target, Wallet } from 'lucide-react';
import { api } from '../../utils/supabase/client';

interface DashboardScreenProps {
  userName: string;
  transactions: any[];
  onAddTransaction: () => void;
  onNavigateToAnalytics: () => void;
  onNavigateToBudget: () => void;
  onRefresh: () => Promise<void>;
}

export function DashboardScreen({ 
  userName, 
  transactions, 
  onAddTransaction, 
  onNavigateToAnalytics,
  onNavigateToBudget,
  onRefresh 
}: DashboardScreenProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [transactions]);

  const loadAnalytics = async () => {
    try {
      const analyticsData = await api.getAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Fallback to local calculation if API fails
      calculateLocalAnalytics();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      await loadAnalytics();
    } finally {
      setIsRefreshing(false);
    }
  };

  const calculateLocalAnalytics = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown: Record<string, number> = {};
    monthlyTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      });

    setAnalytics({
      totalIncome,
      totalExpenses,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0,
      categoryBreakdown
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCategoryData = () => {
    if (!analytics?.categoryBreakdown) return [];
    
    const colors = ['#0A1F44', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
    return Object.entries(analytics.categoryBreakdown)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([name, value], index) => ({
        name,
        value: value as number,
        color: colors[index % colors.length]
      }));
  };

  const categoryData = getCategoryData();
  const totalCategorySpending = categoryData.reduce((sum, cat) => sum + cat.value, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-grid-3">
        <div className="flex items-center justify-between">
          <div>
            <h1>Welcome, {userName}</h1>
            <p className="caption text-muted-foreground mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Content with Pull to Refresh */}
      <PullToRefresh onRefresh={handleRefresh} isRefreshing={isRefreshing}>
        <div className="p-grid-3 pb-20 space-y-6">
          {/* KPI Cards - Enhanced with click handlers */}
          <div className="grid grid-cols-1 gap-4">
            <div onClick={onNavigateToAnalytics} className="cursor-pointer">
              <KPICard
                title="Total Income"
                value={formatCurrency(analytics?.totalIncome || 0)}
                change={analytics?.totalIncome > 0 ? "+12.5% from last month" : undefined}
                changeType="positive"
                icon={TrendingUp}
              />
            </div>
            
            <div onClick={onNavigateToAnalytics} className="cursor-pointer">
              <KPICard
                title="Total Expenses"
                value={formatCurrency(analytics?.totalExpenses || 0)}
                change={analytics?.totalExpenses > 0 ? "-5.2% from last month" : undefined}
                changeType="positive"
                icon={TrendingDown}
              />
            </div>
            
            <div onClick={onNavigateToAnalytics} className="cursor-pointer">
              <KPICard
                title="Savings Rate"
                value={`${analytics?.savingsRate?.toFixed(1) || 0}%`}
                change={analytics?.savingsRate > 0 ? "+2.1% from last month" : undefined}
                changeType="positive"
                icon={DollarSign}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={onNavigateToBudget}>
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium text-foreground mb-1">Budget</h3>
                <p className="caption text-muted-foreground">Manage your budgets</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={onNavigateToAnalytics}>
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium text-foreground mb-1">Analytics</h3>
                <p className="caption text-muted-foreground">View detailed insights</p>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Spending by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="p-grid-3">
              {categoryData.length > 0 ? (
                <>
                  {/* Pie Chart Placeholder */}
                  <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="caption text-muted-foreground">Category breakdown</p>
                      <p className="caption text-muted-foreground">
                        Total: {formatCurrency(totalCategorySpending)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Category Legend */}
                  <div className="space-y-3">
                    {categoryData.map((category, index) => {
                      const percentage = totalCategorySpending > 0 
                        ? ((category.value / totalCategorySpending) * 100).toFixed(0)
                        : 0;
                      
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="body-medium text-foreground">{category.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="body-medium font-medium text-foreground">
                              {formatCurrency(category.value)}
                            </span>
                            <p className="caption text-muted-foreground">
                              {percentage}%
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No spending data available</p>
                  <p className="caption text-muted-foreground mt-1">
                    Add some transactions to see your spending breakdown
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          {transactions.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Transactions</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {/* Navigate to transactions */}}
                    className="text-primary hover:text-primary"
                  >
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-grid-3">
                <div className="space-y-3">
                  {transactions.slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{transaction.description}</p>
                        <p className="caption text-muted-foreground">
                          {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty state when no transactions */}
          {transactions.length === 0 && (
            <Card>
              <CardContent className="p-grid-4 text-center">
                <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">Start tracking your finances</h3>
                <p className="caption text-muted-foreground mb-4">
                  Add your first transaction to see your financial overview
                </p>
                <Button onClick={onAddTransaction} className="w-full">
                  Add Your First Transaction
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </PullToRefresh>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={onAddTransaction} />
    </div>
  );
}