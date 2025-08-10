import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCurrency } from '@/contexts/CurrencyContext';

const budgets = [
  {
    id: 1,
    category: 'Food & Dining',
    spent: 85600,
    budget: 100000,
    icon: '🍽️',
    status: 'good'
  },
  {
    id: 2,
    category: 'Transportation',
    spent: 42000,
    budget: 50000,
    icon: '🚗',
    status: 'good'
  },
  {
    id: 3,
    category: 'Entertainment',
    spent: 38000,
    budget: 30000,
    icon: '🎬',
    status: 'over'
  },
  {
    id: 4,
    category: 'Shopping',
    spent: 54700,
    budget: 60000,
    icon: '🛍️',
    status: 'warning'
  },
  {
    id: 5,
    category: 'Utilities',
    spent: 68000,
    budget: 70000,
    icon: '⚡',
    status: 'warning'
  }
];

const aiSuggestions = [
  {
    id: 1,
    type: 'warning',
    title: 'Entertainment Budget Exceeded',
    message: 'You\'ve spent KSh 8,000 more than planned. Consider reducing streaming subscriptions.',
    action: 'Review expenses'
  },
  {
    id: 2,
    type: 'tip',
    title: 'Great Food Savings!',
    message: 'You\'re KSh 14,400 under budget for dining. Keep up the home cooking!',
    action: 'Maintain habits'
  },
  {
    id: 3,
    type: 'optimize',
    title: 'Transportation Opportunity',
    message: 'Based on your patterns, try matatu twice a week to save KSh 5,000/month.',
    action: 'Try suggestion'
  }
];

export default function BudgetsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { formatCurrency } = useCurrency();
  
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.budget, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const overallProgress = (totalSpent / totalBudget) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return colors.primary;
      case 'warning': return '#FFA726';
      case 'over': return colors.destructive;
      default: return colors.mutedForeground;
    }
  };

  const getProgressColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage > 100) return colors.destructive;
    if (percentage > 80) return '#FFA726';
    return colors.primary;
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'warning': return 'warning';
      case 'tip': return 'checkmark-circle';
      case 'optimize': return 'trending-up';
      default: return 'information-circle';
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'warning': return colors.destructive;
      case 'tip': return colors.primary;
      case 'optimize': return '#FFA726';
      default: return colors.mutedForeground;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Budgets</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Overall Progress */}
        <Card style={styles.overallCard}>
          <Text style={[styles.overallTitle, { color: colors.text }]}>Overall Budget</Text>
          <View style={styles.overallProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(overallProgress, 100)}%`,
                    backgroundColor: getProgressColor(totalSpent, totalBudget)
                  }
                ]} 
              />
            </View>
            <Text style={[styles.overallAmount, { color: colors.text }]}>
              {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
            </Text>
          </View>
        </Card>

        {/* Budget Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
          
          {budgets.map((budget) => {
            const percentage = (budget.spent / budget.budget) * 100;
            const progressColor = getProgressColor(budget.spent, budget.budget);
            
            return (
              <Card key={budget.id} style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                  <View style={styles.budgetIcon}>
                    <Text style={styles.budgetEmoji}>{budget.icon}</Text>
                  </View>
                  
                  <View style={styles.budgetInfo}>
                    <Text style={[styles.budgetCategory, { color: colors.text }]}>
                      {budget.category}
                    </Text>
                    <Text style={[styles.budgetAmount, { color: colors.mutedForeground }]}>
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.budget)}
                    </Text>
                  </View>
                  
                  <View style={styles.budgetStatus}>
                    <Text style={[styles.budgetPercentage, { color: progressColor }]}>
                      {percentage.toFixed(0)}%
                    </Text>
                  </View>
                </View>
                
                <View style={styles.budgetProgress}>
                  <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: progressColor
                        }
                      ]} 
                    />
                  </View>
                </View>
              </Card>
            );
          })}
        </View>

        {/* AI Suggestions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Insights</Text>
          
          {aiSuggestions.map((suggestion) => (
            <Card key={suggestion.id} style={styles.suggestionCard}>
              <View style={styles.suggestionHeader}>
                <Ionicons 
                  name={getSuggestionIcon(suggestion.type) as any} 
                  size={20} 
                  color={getSuggestionColor(suggestion.type)} 
                />
                <Text style={[styles.suggestionTitle, { color: colors.text }]}>
                  {suggestion.title}
                </Text>
              </View>
              
              <Text style={[styles.suggestionMessage, { color: colors.mutedForeground }]}>
                {suggestion.message}
              </Text>
              
              <TouchableOpacity style={[styles.suggestionAction, { backgroundColor: colors.card }]}>
                <Text style={[styles.suggestionActionText, { color: colors.primary }]}>
                  {suggestion.action}
                </Text>
              </TouchableOpacity>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 8,
  },
  overallCard: {
    margin: 16,
    marginTop: 8,
  },
  overallTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  overallProgress: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  overallAmount: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  budgetCard: {
    marginBottom: 12,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 200, 83, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  budgetEmoji: {
    fontSize: 16,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetCategory: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  budgetAmount: {
    fontSize: 12,
  },
  budgetStatus: {
    alignItems: 'flex-end',
  },
  budgetPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  budgetProgress: {
    marginTop: 8,
  },
  suggestionCard: {
    marginBottom: 12,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  suggestionMessage: {
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  suggestionAction: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  suggestionActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
