import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description: string;
  notes?: string;
}

interface AnalyticsScreenProps {
  transactions: Transaction[];
  onBack: () => void;
}

export function AnalyticsScreen({ transactions, onBack }: AnalyticsScreenProps) {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year'>('month');
  const [compareMode, setCompareMode] = useState(false);

  // Calculate analytics data from real transactions
  const analyticsData = useMemo(() => {
    const now = new Date();
    const getDateRange = (filter: string) => {
      const endDate = new Date(now);
      let startDate = new Date(now);
      
      switch (filter) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }
      
      return { startDate, endDate };
    };

    const calculatePeriodData = (filter: string) => {
      const { startDate, endDate } = getDateRange(filter);
      
      const filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });

      const income = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        income,
        expenses,
        savings: income - expenses,
        transactions: filteredTransactions
      };
    };

    return {
      week: calculatePeriodData('week'),
      month: calculatePeriodData('month'),
      year: calculatePeriodData('year')
    };
  }, [transactions, timeFilter]);

  const currentData = analyticsData[timeFilter];
  const savingsRate = currentData.income > 0 ? ((currentData.savings / currentData.income) * 100).toFixed(1) : '0.0';

  // Prepare chart data
  const chartData = useMemo(() => {
    const now = new Date();
    const data = [];
    
    // Generate data points based on time filter
    const periods = timeFilter === 'week' ? 7 : timeFilter === 'month' ? 30 : 12;
    const unit = timeFilter === 'year' ? 'month' : 'day';
    
    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date(now);
      
      if (timeFilter === 'year') {
        date.setMonth(date.getMonth() - i);
      } else {
        date.setDate(date.getDate() - i);
      }
      
      const dayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        if (timeFilter === 'year') {
          return transactionDate.getMonth() === date.getMonth() && 
                 transactionDate.getFullYear() === date.getFullYear();
        } else {
          return transactionDate.toDateString() === date.toDateString();
        }
      });

      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      data.push({
        name: timeFilter === 'year' 
          ? date.toLocaleDateString('en-US', { month: 'short' })
          : date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
        income,
        expenses,
        net: income - expenses
      });
    }
    
    return data;
  }, [transactions, timeFilter]);

  // Prepare category data for pie chart
  const categoryData = useMemo(() => {
    const expenseTransactions = currentData.transactions.filter(t => t.type === 'expense');
    const categoryTotals = expenseTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: currentData.expenses > 0 ? Math.round((amount / currentData.expenses) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Top 5 categories
  }, [currentData]);

  // Colors for charts
  const chartColors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border p-grid-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1>Analytics</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-grid-3 space-y-6">
        {/* Time Filter */}
        <Card>
          <CardContent className="p-grid-3">
            <Tabs value={timeFilter} onValueChange={(value) => setTimeFilter(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Compare Toggle */}
            <div className="flex items-center justify-between mt-4">
              <Label htmlFor="compare-mode">Compare to Last Period</Label>
              <Switch 
                id="compare-mode"
                checked={compareMode}
                onCheckedChange={setCompareMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-grid-3 text-center">
              <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="caption text-muted-foreground">Income</p>
              <p className="font-medium text-foreground">
                ${currentData.income.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-grid-3 text-center">
              <TrendingDown className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="caption text-muted-foreground">Expenses</p>
              <p className="font-medium text-foreground">
                ${currentData.expenses.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-grid-3 text-center">
              <div className="w-6 h-6 bg-primary rounded-full mx-auto mb-2" />
              <p className="caption text-muted-foreground">Savings</p>
              <p className="font-medium text-foreground">
                ${currentData.savings.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Savings Rate */}
        <Card>
          <CardContent className="p-grid-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Savings Rate</p>
                <p className="caption text-muted-foreground">
                  Percentage of income saved
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-medium text-primary">{savingsRate}%</p>
                {compareMode && (
                  <p className="caption text-green-500">+2.3% vs last {timeFilter}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Income vs Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Income vs Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="p-grid-3">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`$${value}`, '']}
                    labelStyle={{ color: 'var(--foreground)' }}
                    contentStyle={{ 
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="income" 
                    fill="var(--chart-3)" 
                    name="Income"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="expenses" 
                    fill="var(--chart-5)" 
                    name="Expenses"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Spending Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Spending Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="p-grid-3">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`$${value}`, '']}
                    labelStyle={{ color: 'var(--foreground)' }}
                    contentStyle={{ 
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="var(--chart-5)" 
                    strokeWidth={3}
                    name="Expenses"
                    dot={{ fill: 'var(--chart-5)', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="net" 
                    stroke="var(--chart-1)" 
                    strokeWidth={3}
                    name="Net (Income - Expenses)"
                    dot={{ fill: 'var(--chart-1)', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        {categoryData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Expense Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="p-grid-3">
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      labelStyle={{ fontSize: '12px', fill: 'var(--foreground)' }}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`$${value}`, 'Amount']}
                      labelStyle={{ color: 'var(--foreground)' }}
                      contentStyle={{ 
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Categories List */}
        <Card>
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-grid-3">
            {categoryData.length > 0 ? (
              <div className="space-y-3">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="body-medium text-foreground">{category.name}</p>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="body-medium font-medium text-foreground">
                        ${category.amount.toLocaleString()}
                      </p>
                      <p className="caption text-muted-foreground">
                        {category.percentage}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="caption text-muted-foreground">
                  No expense data available for the selected period
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}