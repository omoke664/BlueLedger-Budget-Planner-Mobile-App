import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCurrency } from '@/contexts/CurrencyContext';

const monthlyData = [
  { month: 'Oct', income: 420000, expenses: 280000 },
  { month: 'Nov', income: 450000, expenses: 320000 },
  { month: 'Dec', income: 420000, expenses: 290000 },
  { month: 'Jan', income: 420000, expenses: 284300 },
];

const categoryData = [
  { name: 'Food & Dining', value: 85600, color: '#FF5252' },
  { name: 'Transportation', value: 42000, color: '#FF7043' },
  { name: 'Utilities', value: 68000, color: '#FF8A65' },
  { name: 'Entertainment', value: 34000, color: '#FFAB91' },
  { name: 'Shopping', value: 54700, color: '#FFCCBC' },
];

const savingsData = [
  { month: 'Oct', savings: 140000 },
  { month: 'Nov', savings: 130000 },
  { month: 'Dec', savings: 130000 },
  { month: 'Jan', savings: 135700 },
];

export default function ReportsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { formatCurrency } = useCurrency();
  
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  
  const periods = ['This Week', 'This Month', 'Last 3 Months', 'This Year'];
  
  const totalIncome = 420000;
  const totalExpenses = 284300;
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = (netSavings / totalIncome) * 100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Reports</Text>
          <TouchableOpacity style={styles.calendarButton}>
            <Ionicons name="calendar-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.periodSelector}
          contentContainerStyle={styles.periodSelectorContent}
        >
          {periods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodChip,
                {
                  backgroundColor: selectedPeriod === period ? colors.primary : colors.card,
                }
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodChipText,
                { color: selectedPeriod === period ? colors.primaryForeground : colors.text }
              ]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryContent}>
              <Ionicons name="trending-up" size={20} color={colors.primary} />
              <Text style={[styles.summaryAmount, { color: colors.primary }]}>
                {formatCurrency(totalIncome, false)}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Income</Text>
            </View>
          </Card>

          <Card style={styles.summaryCard}>
            <View style={styles.summaryContent}>
              <Ionicons name="trending-down" size={20} color={colors.destructive} />
              <Text style={[styles.summaryAmount, { color: colors.destructive }]}>
                {formatCurrency(totalExpenses, false)}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Expenses</Text>
            </View>
          </Card>

          <Card style={styles.summaryCard}>
            <View style={styles.summaryContent}>
              <Ionicons name="wallet" size={20} color={colors.primary} />
              <Text style={[styles.summaryAmount, { color: colors.primary }]}>
                {formatCurrency(netSavings, false)}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Savings</Text>
            </View>
          </Card>
        </View>

        {/* Charts Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Spending Trends</Text>
          
          <Card style={styles.chartCard}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Monthly Overview</Text>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="bar-chart-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.chartPlaceholderText, { color: colors.mutedForeground }]}>
                Chart visualization will be implemented with Victory Native
              </Text>
            </View>
          </Card>
        </View>

        {/* Category Breakdown */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Category Breakdown</Text>
          
          {categoryData.map((category, index) => (
            <Card key={category.name} style={styles.categoryCard}>
              <View style={styles.categoryContent}>
                <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
                
                <View style={styles.categoryInfo}>
                  <Text style={[styles.categoryName, { color: colors.text }]}>
                    {category.name}
                  </Text>
                  <Text style={[styles.categoryAmount, { color: colors.mutedForeground }]}>
                    {formatCurrency(category.value)}
                  </Text>
                </View>
                
                <Text style={[styles.categoryPercentage, { color: colors.text }]}>
                  {((category.value / categoryData.reduce((sum, c) => sum + c.value, 0)) * 100).toFixed(1)}%
                </Text>
              </View>
            </Card>
          ))}
        </View>

        {/* Savings Analysis */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Savings Analysis</Text>
          
          <Card style={styles.savingsCard}>
            <View style={styles.savingsHeader}>
              <Text style={[styles.savingsTitle, { color: colors.text }]}>Savings Rate</Text>
              <Text style={[styles.savingsRate, { color: colors.primary }]}>
                {savingsRate.toFixed(1)}%
              </Text>
            </View>
            
            <View style={styles.savingsProgress}>
              <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min(savingsRate, 100)}%`,
                      backgroundColor: colors.primary
                    }
                  ]} 
                />
              </View>
            </View>
            
            <Text style={[styles.savingsDescription, { color: colors.mutedForeground }]}>
              You're saving {savingsRate.toFixed(1)}% of your income this month. 
              {savingsRate >= 20 ? ' Great job!' : ' Consider increasing your savings rate.'}
            </Text>
          </Card>
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
  calendarButton: {
    padding: 8,
  },
  periodSelector: {
    marginBottom: 16,
  },
  periodSelectorContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  periodChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  periodChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  summarySection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
  },
  summaryContent: {
    alignItems: 'center',
    gap: 4,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
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
  chartCard: {
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartPlaceholder: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  chartPlaceholderText: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  categoryCard: {
    marginBottom: 8,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  categoryAmount: {
    fontSize: 12,
  },
  categoryPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  savingsCard: {
    marginBottom: 12,
  },
  savingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  savingsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  savingsRate: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  savingsProgress: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  savingsDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
});
