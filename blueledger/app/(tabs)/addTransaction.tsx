import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { transactionService } from '@/lib/database';

export default function AddTransactionScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const router = useRouter();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  const handleSaveTransaction = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to add a transaction.');
      return;
    }

    if (!amount || !description || !category) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      await transactionService.createTransaction({
        user_id: user.id,
        amount: parseFloat(amount),
        description,
        category_id: category, // This will need to be updated to a real category id
        type,
        timestamp: new Date().toISOString(),
      });
      Alert.alert('Success', 'Transaction added successfully.');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add transaction.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Add Transaction</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'expense' && styles.typeButtonSelected]}
            onPress={() => setType('expense')}
          >
            <Text style={[styles.typeButtonText, type === 'expense' && { color: colors.primary }]}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'income' && styles.typeButtonSelected]}
            onPress={() => setType('income')}
          >
            <Text style={[styles.typeButtonText, type === 'income' && { color: colors.primary }]}>Income</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Amount"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Description"
          placeholderTextColor={colors.mutedForeground}
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Category"
          placeholderTextColor={colors.mutedForeground}
          value={category}
          onChangeText={setCategory}
        />

        <Button onPress={handleSaveTransaction}>
          <Text>Save Transaction</Text>
        </Button>
      </View>
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  form: {
    padding: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  typeButton: {
    padding: 10,
    borderRadius: 8,
  },
  typeButtonSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
});