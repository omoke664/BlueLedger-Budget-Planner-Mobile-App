import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { ArrowLeft, Plus, Edit3, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { PullToRefresh } from '../PullToRefresh';

interface BudgetScreenProps {
  onBack: () => void;
  transactions: any[];
}

interface Budget {
  category: string;
  amount: number;
  spent: number;
  color: string;
}

const defaultCategories = [
  'Food & Dining',
  'Transportation', 
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Other'
];

const categoryColors = [
  '#0A1F44', '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

export function BudgetScreen({ onBack, transactions }: BudgetScreenProps) {
  const [budgets, setBudgets] = useState<Record<string, Budget>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');

  useEffect(() => {
    loadBudgets();
  }, [transactions]);

  const loadBudgets = async () => {
    try {
      const response = await api.getBudgets();
      
      // Calculate spending for each category
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlySpending: Record<string, number> = {};
      transactions
        .filter(t => {
          const transactionDate = new Date(t.date);
          return t.type === 'expense' && 
                 transactionDate.getMonth() === currentMonth && 
                 transactionDate.getFullYear() === currentYear;
        })
        .forEach(t => {
          monthlySpending[t.category] = (monthlySpending[t.category] || 0) + t.amount;
        });

      // Merge with saved budgets
      const budgetData = response.budgets || {};
      const updatedBudgets: Record<string, Budget> = {};
      
      defaultCategories.forEach((category, index) => {
        updatedBudgets[category] = {
          category,
          amount: budgetData[category]?.amount || 0,
          spent: monthlySpending[category] || 0,
          color: categoryColors[index % categoryColors.length]
        };
      });

      setBudgets(updatedBudgets);
    } catch (error) {
      console.error('Error loading budgets:', error);
      toast.error('Failed to load budgets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadBudgets();
    setIsRefreshing(false);
  };

  const saveBudget = async (category: string, amount: number) => {
    try {
      const updatedBudgets = { ...budgets };
      updatedBudgets[category] = {
        ...updatedBudgets[category],
        amount
      };
      
      const budgetData: Record<string, { amount: number }> = {};
      Object.values(updatedBudgets).forEach(budget => {
        if (budget.amount > 0) {
          budgetData[budget.category] = { amount: budget.amount };
        }
      });

      await api.updateBudgets(budgetData);
      setBudgets(updatedBudgets);
      toast.success('Budget updated successfully!');
    } catch (error) {
      console.error('Error saving budget:', error);
      toast.error('Failed to save budget');
    }
  };

  const handleEditBudget = (category: string) => {
    setEditingCategory(category);
    setEditAmount(budgets[category]?.amount.toString() || '');
  };

  const handleSaveBudget = async () => {
    if (!editingCategory) return;
    
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount < 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    await saveBudget(editingCategory, amount);
    setEditingCategory(null);
    setEditAmount('');
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditAmount('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getBudgetStatus = (budget: Budget) => {
    if (budget.amount === 0) return 'unset';
    const percentage = (budget.spent / budget.amount) * 100;
    if (percentage >= 100) return 'exceeded';
    if (percentage >= 80) return 'warning';
    return 'good';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeded':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Target className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const totalBudget = Object.values(budgets).reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = Object.values(budgets).reduce((sum, budget) => sum + budget.spent, 0);
  const remainingBudget = totalBudget - totalSpent;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-grid-3">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1>Budget Management</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3">
              <p className="caption text-muted-foreground">Total Budget</p>
              <p className="text-lg font-medium text-foreground">
                {formatCurrency(totalBudget)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <p className="caption text-muted-foreground">Remaining</p>
              <p className={`text-lg font-medium ${
                remainingBudget >= 0 ? 'text-green-500' : 'text-destructive'
              }`}>
                {formatCurrency(remainingBudget)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Budget List */}
      <PullToRefresh onRefresh={handleRefresh} isRefreshing={isRefreshing}>
        <div className="p-grid-3 pb-20 space-y-4">
          {Object.values(budgets).map((budget) => {
            const status = getBudgetStatus(budget);
            const percentage = budget.amount > 0 ? Math.min((budget.spent / budget.amount) * 100, 100) : 0;
            const isEditing = editingCategory === budget.category;

            return (
              <Card key={budget.category} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: budget.color }}
                      />
                      <h3 className="font-medium text-foreground">{budget.category}</h3>
                      {getStatusIcon(status)}
                    </div>
                    
                    {!isEditing && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditBudget(budget.category)}
                        className="p-2"
                      >
                        {budget.amount > 0 ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`budget-${budget.category}`}>Monthly Budget</Label>
                        <Input
                          id={`budget-${budget.category}`}
                          type="number"
                          placeholder="0.00"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSaveBudget}
                          className="flex-1"
                          size="sm"
                        >
                          Save
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={handleCancelEdit}
                          className="flex-1"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {budget.amount > 0 ? (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="body-medium text-muted-foreground">
                              {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                            </span>
                            <span className="caption text-muted-foreground">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                          
                          <Progress 
                            value={percentage} 
                            className={`h-2 ${
                              status === 'exceeded' ? '[&>div]:bg-destructive' :
                              status === 'warning' ? '[&>div]:bg-yellow-500' :
                              '[&>div]:bg-green-500'
                            }`}
                          />
                          
                          <p className="caption text-muted-foreground">
                            {budget.amount - budget.spent >= 0 
                              ? `${formatCurrency(budget.amount - budget.spent)} remaining`
                              : `${formatCurrency(budget.spent - budget.amount)} over budget`
                            }
                          </p>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="caption text-muted-foreground">
                            No budget set for this category
                          </p>
                          <p className="caption text-muted-foreground">
                            Spent: {formatCurrency(budget.spent)} this month
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Budget Tips */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h3 className="font-medium text-foreground mb-2">💡 Budget Tips</h3>
              <div className="space-y-2">
                <p className="caption text-muted-foreground">
                  • Set realistic budgets based on your spending history
                </p>
                <p className="caption text-muted-foreground">
                  • Review and adjust budgets monthly
                </p>
                <p className="caption text-muted-foreground">
                  • Focus on categories where you overspend most
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PullToRefresh>
    </div>
  );
}