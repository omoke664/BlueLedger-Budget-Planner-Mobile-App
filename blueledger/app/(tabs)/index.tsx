import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Platform } from 'react-native';

import { Card } from '@/components/ui/Card';
import { transactionService } from '@/lib/database';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSmsListener } from '@/hooks/useSmsListener'; // Import the new hook


export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { formatCurrency } = useCurrency();
  const { user } = useAuth();
  const router = useRouter();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the SMS listener hook
  const { isListening, lastProcessedSms, startSmsListener, stopSmsListener } = useSmsListener((parsedTransaction) => {
    // Callback when a new transaction is parsed and inserted
    // Refresh transactions or update state as needed
    if (user) {
      fetchTransactions(); // Re-fetch all transactions to update the list
    }
  });

  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await transactionService.getTransactions(user.id);
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();

    // No need for SmsListener.removeListener here, the hook handles its own cleanup
    return () => {
      // If you want to explicitly stop listening when component unmounts
      // stopSmsListener(); 
    };
  }, [user]);

  const handleConnectMpesa = async () => {
    // The hook handles permission request and listener setup
    startSmsListener();
  };

  // Calculate balance, income, expenses
  const totalBalance = transactions.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0);
  const monthlyIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>  
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Dashboard</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <Card variant="gradient" style={styles.balanceCard}>
          <View style={styles.balanceContent}>
            <Text style={[styles.balanceLabel, { color: colors.mutedForeground }]}>Total Balance</Text>
            <Text style={[styles.balanceAmount, { color: colors.primary }]}>
              {formatCurrency(totalBalance)}
            </Text>
            <View style={styles.balanceStats}>
              <View style={styles.statItem}>
                <View style={styles.statHeader}>
                  <Ionicons name="arrow-down" size={16} color={colors.primary} />
                  <Text style={[styles.statLabel, { color: colors.primary }]}>Income</Text>
                </View>
                <Text style={[styles.statAmount, { color: colors.text }]}>
                  {formatCurrency(monthlyIncome)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statHeader}>
                  <Ionicons name="arrow-up" size={16} color={colors.destructive} />
                  <Text style={[styles.statLabel, { color: colors.destructive }]}>Expenses</Text>
                </View>
                <Text style={[styles.statAmount, { color: colors.text }]}>
                  {formatCurrency(monthlyExpenses)}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={() => router.push('/addTransaction')}
            >
              <Ionicons name="add" size={24} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.text }]}>Add Transaction</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]}>
              <Ionicons name="target" size={24} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.text }]}>Set Budget</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={handleConnectMpesa}
            >
              <Ionicons name="phone-portrait-outline" size={24} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.text }]}>Connect M-Pesa</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Display SMS Listener Status and Last Processed SMS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>SMS Listener Status</Text>
          <Text style={{ color: colors.text }}>
            Listening: {isListening ? 'Yes' : 'No'}
          </Text>
          {lastProcessedSms && (
            <View style={{ marginTop: 10 }}>
              <Text style={{ color: colors.text, fontWeight: 'bold' }}>Last Processed SMS:</Text>
              <Text style={{ color: colors.text, fontSize: 12 }}>{lastProcessedSms}</Text>
            </View>
          )}
          <Button onPress={stopSmsListener} title="Stop SMS Listener" />
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/transactions')}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 24 }} />
          ) : error ? (
            <Text style={{ color: colors.destructive, textAlign: 'center', marginVertical: 24 }}>{error}</Text>
          ) : transactions.length === 0 ? (
            <Text style={{ color: colors.mutedForeground, textAlign: 'center', marginVertical: 24 }}>No transactions yet.</Text>
          ) : (
            transactions.slice(0, 5).map((transaction) => (
              <Card key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionContent}>
                  <View style={styles.transactionIcon}>
                    <Ionicons
                      name={transaction.type === 'income' ? 'arrow-down-circle' : 'arrow-up-circle'}
                      size={20}
                      color={transaction.type === 'income' ? colors.primary : colors.destructive}
                    />
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={[styles.transactionDescription, { color: colors.text }]}>
                      {transaction.description || 'No description'}
                    </Text>
                    <Text style={[styles.transactionCategory, { color: colors.mutedForeground }]}>
                      {transaction.category?.name || 'Uncategorized'} • {new Date(transaction.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    { color: transaction.type === 'income' ? colors.primary : colors.destructive }
                  ]}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                  </Text>
                </View>
              </Card>
            ))
          )}
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
  notificationButton: {
    padding: 8,
  },
  balanceCard: {
    margin: 16,
    marginTop: 8,
  },
  balanceContent: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  statAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionCard: {
    marginBottom: 8,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 200, 83, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});