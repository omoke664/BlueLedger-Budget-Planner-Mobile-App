import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Read from environment variables first, then fall back to app.json
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file or app.json configuration.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  currency: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  type: 'income' | 'expense';
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Source {
  id: string;
  user_id: string;
  name: string;
  type: 'bank' | 'cash' | 'credit_card' | 'mobile_money' | 'other';
  currency: string;
  balance: number;
  metadata: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  source_id?: string;
  category_id?: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  description?: string;
  merchant?: string;
  timestamp: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id?: string;
  name: string;
  amount: number;
  currency: string;
  period: 'monthly' | 'weekly' | 'yearly';
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BudgetTracking {
  id: string;
  budget_id: string;
  user_id: string;
  spent_amount: number;
  tracking_date: string;
  created_at: string;
  updated_at: string;
}

export interface SyncStatus {
  id: string;
  user_id: string;
  device_id?: string;
  last_sync: string;
  sync_type: string;
  created_at: string;
  updated_at: string;
}
