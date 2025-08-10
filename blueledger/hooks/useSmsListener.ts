import { useEffect, useState } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import SmsListener from 'react-native-sms-listener';
import { supabase } from '../lib/supabase';
import { transactionService } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';

interface MpesaTransaction {
  amount: number;
  type: 'income' | 'expense';
  timestamp: Date;
  description?: string;
  merchant?: string;
  balance?: number;
  transactionCode?: string;
}

const parseMpesaSms = (smsBody: string): MpesaTransaction | null => {
  const patterns = [
    { type: 'income', regex: /^([A-Z0-9]+) Confirmed\.?\s*You (?:have )?received Ksh([\d,\.]+) from ([A-Z\s]+) (\d+) on (\d{1,2}\/\d{1,2}\/\d{2,4}) at (\d{1,2}:\d{2} (?:AM|PM))\.? New M-PESA balance is Ksh([\d,\.]+)/, groups: { transactionCode: 1, amount: 2, merchant: 3, date: 5, time: 6, balance: 7, description: (m: RegExpMatchArray) => `Received from ${m[3]}` } },
    { type: 'expense', regex: /^([A-Z0-9]+) Confirmed\.?\s*Ksh([\d,\.]+) sent to (.+?) (?:\d+)? on (\d{1,2}\/\d{1,2}\/\d{2,4}) at (\d{1,2}:\d{2} (?:AM|PM))\.? New M-PESA balance is Ksh([\d,\.]+)/, groups: { transactionCode: 1, amount: 2, merchant: 3, date: 4, time: 5, balance: 6, description: (m: RegExpMatchArray) => `Sent to ${m[3]}` } },
    { type: 'expense', regex: /^([A-Z0-9]+) Confirmed\.?\s*Ksh([\d,\.]+) paid to (.+?) for account (.+?) on (\d{1,2}\/\d{1,2}\/\d{2,4}) at (\d{1,2}:\d{2} (?:AM|PM))\.? New M-PESA balance is Ksh([\d,\.]+)/, groups: { transactionCode: 1, amount: 2, merchant: 3, description: (m: RegExpMatchArray) => `Paid to ${m[3]} (Acc: ${m[4]})`, date: 5, time: 6, balance: 7 } },
    { type: 'expense', regex: /^([A-Z0-9]+) Confirmed\.?\s*Ksh([\d,\.]+) paid to (.+?) on (\d{1,2}\/\d{1,2}\/\d{2,4}) at (\d{1,2}:\d{2} (?:AM|PM))\.? New M-PESA balance is Ksh([\d,\.]+)/, groups: { transactionCode: 1, amount: 2, merchant: 3, date: 4, time: 5, balance: 6, description: (m: RegExpMatchArray) => `Paid to ${m[3]}` } },
    { type: 'expense', regex: /^([A-Z0-9]+) Confirmed\.?\s*Ksh([\d,\.]+) airtime bought for (\d+) on (\d{1,2}\/\d{1,2}\/\d{2,4}) at (\d{1,2}:\d{2} (?:AM|PM))\.? New M-PESA balance is Ksh([\d,\.]+)/, groups: { transactionCode: 1, amount: 2, merchant: (m: RegExpMatchArray) => `Airtime for ${m[3]}`, description: (m: RegExpMatchArray) => `Airtime for ${m[3]}`, date: 4, time: 5, balance: 6 } },
    { type: 'expense', regex: /^([A-Z0-9]+) Confirmed\.?\s*Ksh([\d,\.]+) withdrawn from agent (\d+) at (\d+) on (\d{1,2}\/\d{1,2}\/\d{2,4}) at (\d{1,2}:\d{2} (?:AM|PM))\.? New M-PESA balance is Ksh([\d,\.]+)/, groups: { transactionCode: 1, amount: 2, merchant: (m: RegExpMatchArray) => `Agent ${m[3]}`, description: (m: RegExpMatchArray) => `Withdrawal from Agent ${m[3]}`, date: 5, time: 6, balance: 7 } },
  ];

  for (const pattern of patterns) {
    const match = smsBody.match(pattern.regex);
    if (match) {
      const amount = parseFloat(match[pattern.groups.amount].replace(/,/g, ''));
      const balance = parseFloat(match[pattern.groups.balance].replace(/,/g, ''));
      const datePart = match[pattern.groups.date];
      const timePart = match[pattern.groups.time];
      
      const [month, day, year] = datePart.split('/').map(Number);
      const fullYear = year < 100 ? 2000 + year : year;
      const timestamp = new Date(fullYear, month - 1, day, 
        parseInt(timePart.split(':')[0]) + (timePart.includes('PM') && parseInt(timePart.split(':')[0]) !== 12 ? 12 : 0) - (timePart.includes('AM') && parseInt(timePart.split(':')[0]) === 12 ? 12 : 0),
        parseInt(timePart.split(':')[1].substring(0, 2))
      );

      let merchant: string | undefined;
      if (typeof pattern.groups.merchant === 'function') {
        merchant = pattern.groups.merchant(match);
      } else if (pattern.groups.merchant) {
        merchant = match[pattern.groups.merchant];
      }

      let description: string | undefined;
      if (typeof pattern.groups.description === 'function') {
        description = pattern.groups.description(match);
      } else if (pattern.groups.description) {
        description = match[pattern.groups.description];
      }

      const transactionCode = match[pattern.groups.transactionCode];

      return {
        type: pattern.type,
        amount,
        currency: 'KES',
        description,
        merchant,
        timestamp,
        balance,
        transactionCode,
      };
    }
  }
  // If no pattern matches, log the message and return null
  console.log('Unmatched M-Pesa SMS:', smsBody);
  return null;
};

export const useSmsListener = (onTransactionParsed?: (transaction: MpesaTransaction) => void) => {
  const { user, loading } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [lastProcessedSms, setLastProcessedSms] = useState<string | null>(null);

  const startSmsListener = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Not Supported', 'M-Pesa SMS listening is only supported on Android.');
      return;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'SMS Permission',
          message: 'BlueLedger needs access to your SMS messages to automatically track M-Pesa transactions.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('SMS permission denied');
        Alert.alert('Permission Denied', 'SMS permission is required to automatically track M-Pesa transactions.');
        return;
      }
      
      console.log('SMS permission granted');
      if (user) {
        if (!isListening) {
            setupListener();
        }
      } else {
        Alert.alert('Authentication Required', 'Please log in to start tracking M-Pesa transactions.');
      }

    } catch (err: any) {
      console.warn(err);
      Alert.alert('Error', `Failed to request SMS permission: ${err.message}`);
    }
  };

  const setupListener = () => {
    if (Platform.OS !== 'android' || isListening) return;

    SmsListener.addListener('onMessage', async (msg: { body: string; origin: string }) => {
      if (msg.origin.includes('M-PESA') || msg.body.includes('M-PESA') || msg.origin.includes('MPESA')) {
        const transaction = parseMpesaSms(msg.body);
        if (transaction) {
          console.log('Parsed M-Pesa transaction:', transaction);
          setLastProcessedSms(JSON.stringify(transaction, null, 2));

          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            const getOrCreateSource = async () => {
              let { data: source, error: sourceError } = await supabase
                .from('sources')
                .select('id')
                .eq('user_id', user.id)
                .eq('name', 'M-Pesa')
                .single();

              if (sourceError && sourceError.code === 'PGRST116') {
                console.log('M-Pesa source not found, creating it...');
                const { data: newSource, error: createSourceError } = await supabase
                  .from('sources')
                  .insert({
                    user_id: user.id,
                    name: 'M-Pesa',
                    type: 'mobile_money',
                    currency: 'KES',
                    balance: 0
                  })
                  .select('id')
                  .single();
                if (createSourceError) throw createSourceError;
                return newSource;
              } else if (sourceError) {
                throw sourceError;
              }
              return source;
            };

            const getOrCreateCategory = async () => {
              const categoryName = transaction.type === 'income' ? 'Uncategorized Income' : 'Uncategorized Expense';
              let { data: category, error: categoryError } = await supabase
                .from('categories')
                .select('id')
                .eq('user_id', user.id)
                .eq('name', categoryName)
                .single();

              if (categoryError && categoryError.code === 'PGRST116') {
                console.log(`Category '${categoryName}' not found, creating it...`);
                const { data: newCategory, error: createCategoryError } = await supabase
                  .from('categories')
                  .insert({
                    user_id: user.id,
                    name: categoryName,
                    type: transaction.type,
                    color: '#CCCCCC',
                    icon: 'tag',
                    is_default: true
                  })
                  .select('id')
                  .single();
                if (createCategoryError) throw createCategoryError;
                return newCategory;
              } else if (categoryError) {
                throw categoryError;
              }
              return category;
            };

            try {
                const [source, category] = await Promise.all([
                    getOrCreateSource(),
                    getOrCreateCategory()
                ]);

                let existingTransaction;
                if (transaction.transactionCode) {
                  existingTransaction = await transactionService.getTransactionByCode(
                    user.id,
                    transaction.transactionCode
                  );
                } else {
                  existingTransaction = await transactionService.getSimilarTransaction(
                    user.id,
                    transaction.amount,
                    transaction.timestamp,
                    transaction.merchant
                  );
                }

                if (existingTransaction) {
                  console.log('Duplicate M-Pesa transaction skipped:', transaction);
                  Alert.alert('Duplicate Transaction', 'This M-Pesa transaction has already been recorded.');
                  return;
                }

                const { error: insertError } = await supabase
                  .from('transactions')
                  .insert({
                    user_id: user.id,
                    source_id: source?.id,
                    category_id: category?.id,
                    type: transaction.type,
                    amount: transaction.amount,
                    currency: 'KES',
                    description: transaction.description || `M-Pesa ${transaction.type}`,
                    merchant: transaction.merchant,
                    timestamp: transaction.timestamp.toISOString(),
                    metadata: { rawSms: msg.body, transactionCode: transaction.transactionCode },
                  });

                if (insertError) {
                  console.error('Error inserting transaction:', insertError);
                  Alert.alert('Error', `Failed to insert transaction: ${insertError.message}`);
                } else {
                  console.log('Transaction inserted successfully!');
                  Alert.alert('Transaction Added', `M-Pesa transaction of ${transaction.amount} KES added.`);
                  if (onTransactionParsed) {
                    onTransactionParsed(transaction);
                  }
                }
            } catch (error: any) {
                console.error('Error getting or creating source/category:', error);
                Alert.alert('Error', `Failed to process transaction: ${error.message}`);
            }
          }
        }
      }
    });
    setIsListening(true);
    console.log('SMS listener started.');
  };

  const stopSmsListener = () => {
    if (!isListening) return;
    SmsListener.removeAllListeners();
    setIsListening(false);
    console.log('SMS listener stopped.');
  };

  useEffect(() => {
    if (!loading) {
      if (user && !isListening) {
        setupListener();
      } else if (!user && isListening) {
        stopSmsListener();
      }
    }
    
    return () => {
      stopSmsListener();
    };
  }, [user, loading, isListening]);

  return { isListening, lastProcessedSms, startSmsListener, stopSmsListener };
};