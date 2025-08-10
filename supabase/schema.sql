-- BlueLedger Database Schema
-- This schema includes all necessary tables for the budget planner app

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  currency text DEFAULT 'KES',
  timezone text DEFAULT 'Africa/Nairobi',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text DEFAULT '#00C853',
  icon text DEFAULT 'tag',
  type text DEFAULT 'expense' CHECK (type IN ('income', 'expense')),
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_user_name_unique UNIQUE (user_id, name)
);

-- Sources table (for transaction sources like bank accounts, cash, etc.)
CREATE TABLE IF NOT EXISTS public.sources (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('bank', 'cash', 'credit_card', 'mobile_money', 'other')),
  currency text DEFAULT 'KES',
  balance numeric DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sources_pkey PRIMARY KEY (id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_id uuid REFERENCES public.sources(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'KES',
  description text,
  merchant text,
  timestamp timestamp with time zone NOT NULL DEFAULT now(), -- Changed from 'date' to 'timestamp' to match original schema
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id)
);

-- Budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'KES',
  period text NOT NULL CHECK (period IN ('monthly', 'weekly', 'yearly')),
  start_date date NOT NULL,
  end_date date,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT budgets_pkey PRIMARY KEY (id)
);

-- Budget tracking table (for tracking spending against budgets)
CREATE TABLE IF NOT EXISTS public.budget_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  budget_id uuid NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  spent_amount numeric NOT NULL DEFAULT 0,
  tracking_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT budget_tracking_pkey PRIMARY KEY (id),
  CONSTRAINT budget_tracking_unique UNIQUE (budget_id, tracking_date)
);

-- Sync status table
CREATE TABLE IF NOT EXISTS public.sync_status (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_id text,
  last_sync timestamp with time zone DEFAULT now(),
  sync_type text DEFAULT 'full',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sync_status_pkey PRIMARY KEY (id)
);

-- Add missing columns to existing tables if they don't exist
DO $$ 
BEGIN
  -- Add type column to categories if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'type') THEN
    ALTER TABLE public.categories ADD COLUMN type text DEFAULT 'expense' CHECK (type IN ('income', 'expense'));
  END IF;
  
  -- Add is_default column to categories if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'is_default') THEN
    ALTER TABLE public.categories ADD COLUMN is_default boolean DEFAULT false;
  END IF;
  
  -- Add color column to categories if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'color') THEN
    ALTER TABLE public.categories ADD COLUMN color text DEFAULT '#00C853';
  END IF;
  
  -- Add icon column to categories if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'icon') THEN
    ALTER TABLE public.categories ADD COLUMN icon text DEFAULT 'tag';
  END IF;
  
  -- Add timestamp column to transactions if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'timestamp') THEN
    ALTER TABLE public.transactions ADD COLUMN timestamp timestamp with time zone NOT NULL DEFAULT now();
  END IF;
END $$;

-- Create indexes for better performance (only if they don't exist)
DO $$ 
BEGIN
  -- Transactions indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_transactions_user_id') THEN
    CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
  END IF;
  
  -- Check if timestamp column exists before creating index
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_transactions_timestamp') AND 
     EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'timestamp') THEN
    CREATE INDEX idx_transactions_timestamp ON public.transactions(timestamp);
  END IF;
  
  -- Check if category_id column exists before creating index
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_transactions_category_id') AND 
     EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'category_id') THEN
    CREATE INDEX idx_transactions_category_id ON public.transactions(category_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_transactions_type') THEN
    CREATE INDEX idx_transactions_type ON public.transactions(type);
  END IF;

  -- Budgets indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_budgets_user_id') THEN
    CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
  END IF;
  
  -- Check if category_id column exists before creating index
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_budgets_category_id') AND 
     EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'budgets' AND column_name = 'category_id') THEN
    CREATE INDEX idx_budgets_category_id ON public.budgets(category_id);
  END IF;
  
  -- Check if period column exists before creating index
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_budgets_period') AND 
     EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'budgets' AND column_name = 'period') THEN
    CREATE INDEX idx_budgets_period ON public.budgets(period);
  END IF;

  -- Categories indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_categories_user_id') THEN
    CREATE INDEX idx_categories_user_id ON public.categories(user_id);
  END IF;
  
  -- Check if type column exists before creating index
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_categories_type') AND 
     EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'type') THEN
    CREATE INDEX idx_categories_type ON public.categories(type);
  END IF;

  -- Sources indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sources_user_id') THEN
    CREATE INDEX idx_sources_user_id ON public.sources(user_id);
  END IF;
  
  -- Check if type column exists before creating index
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sources_type') AND 
     EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sources' AND column_name = 'type') THEN
    CREATE INDEX idx_sources_type ON public.sources(type);
  END IF;
END $$;

-- Create RLS (Row Level Security) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;

DROP POLICY IF EXISTS "Users can view own sources" ON public.sources;
DROP POLICY IF EXISTS "Users can insert own sources" ON public.sources;
DROP POLICY IF EXISTS "Users can update own sources" ON public.sources;
DROP POLICY IF EXISTS "Users can delete own sources" ON public.sources;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;

DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;

DROP POLICY IF EXISTS "Users can view own budget tracking" ON public.budget_tracking;
DROP POLICY IF EXISTS "Users can insert own budget tracking" ON public.budget_tracking;
DROP POLICY IF EXISTS "Users can update own budget tracking" ON public.budget_tracking;

DROP POLICY IF EXISTS "Users can view own sync status" ON public.sync_status;
DROP POLICY IF EXISTS "Users can insert own sync status" ON public.sync_status;
DROP POLICY IF EXISTS "Users can update own sync status" ON public.sync_status;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories policies
CREATE POLICY "Users can view own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- Sources policies
CREATE POLICY "Users can view own sources" ON public.sources
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sources" ON public.sources
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sources" ON public.sources
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sources" ON public.sources
  FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Budgets policies
CREATE POLICY "Users can view own budgets" ON public.budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON public.budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON public.budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON public.budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Budget tracking policies
CREATE POLICY "Users can view own budget tracking" ON public.budget_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budget tracking" ON public.budget_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget tracking" ON public.budget_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- Sync status policies
CREATE POLICY "Users can view own sync status" ON public.sync_status
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync status" ON public.sync_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sync status" ON public.sync_status
  FOR UPDATE USING (auth.uid() = user_id);

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_updated_at') THEN
    CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_sources_updated_at') THEN
    CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON public.sources
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_transactions_updated_at') THEN
    CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_budgets_updated_at') THEN
    CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_budget_tracking_updated_at') THEN
    CREATE TRIGGER update_budget_tracking_updated_at BEFORE UPDATE ON public.budget_tracking
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_sync_status_updated_at') THEN
    CREATE TRIGGER update_sync_status_updated_at BEFORE UPDATE ON public.sync_status
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Function to create default categories for new users
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default expense categories (only if they don't exist)
  INSERT INTO public.categories (user_id, name, color, icon, type, is_default)
  SELECT NEW.id, 'Food & Dining', '#FF6B6B', 'restaurant', 'expense', true
  WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE user_id = NEW.id AND name = 'Food & Dining');
  
  INSERT INTO public.categories (user_id, name, color, icon, type, is_default)
  SELECT NEW.id, 'Transportation', '#4ECDC4', 'car', 'expense', true
  WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE user_id = NEW.id AND name = 'Transportation');
  
  INSERT INTO public.categories (user_id, name, color, icon, type, is_default)
  SELECT NEW.id, 'Shopping', '#45B7D1', 'shopping-bag', 'expense', true
  WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE user_id = NEW.id AND name = 'Shopping');
  
  INSERT INTO public.categories (user_id, name, color, icon, type, is_default)
  SELECT NEW.id, 'Entertainment', '#96CEB4', 'game-controller', 'expense', true
  WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE user_id = NEW.id AND name = 'Entertainment');
  
  INSERT INTO public.categories (user_id, name, color, icon, type, is_default)
  SELECT NEW.id, 'Healthcare', '#FFEAA7', 'medical', 'expense', true
  WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE user_id = NEW.id AND name = 'Healthcare');
  
  INSERT INTO public.categories (user_id, name, color, icon, type, is_default)
  SELECT NEW.id, 'Education', '#DDA0DD', 'book', 'expense', true
  WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE user_id = NEW.id AND name = 'Education');
  
  INSERT INTO public.categories (user_id, name, color, icon, type, is_default)
  SELECT NEW.id, 'Utilities', '#98D8C8', 'lightbulb', 'expense', true
  WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE user_id = NEW.id AND name = 'Utilities');
  
  INSERT INTO public.categories (user_id, name, color, icon, type, is_default)
  SELECT NEW.id, 'Housing', '#F7DC6F', 'home', 'expense', true
  WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE user_id = NEW.id AND name = 'Housing');
  
  -- Insert default income categories (only if they don't exist)
  INSERT INTO public.categories (user_id, name, color, icon, type, is_default)
  SELECT NEW.id, 'Salary', '#00C853', 'briefcase', 'income', true
  WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE user_id = NEW.id AND name = 'Salary');
  
  INSERT INTO public.categories (user_id, name, color, icon, type, is_default)
  SELECT NEW.id, 'Freelance', '#FF9800', 'laptop', 'income', true
  WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE user_id = NEW.id AND name = 'Freelance');
  
  INSERT INTO public.categories (user_id, name, color, icon, type, is_default)
  SELECT NEW.id, 'Investment', '#9C27B0', 'trending-up', 'income', true
  WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE user_id = NEW.id AND name = 'Investment');
  
  INSERT INTO public.categories (user_id, name, color, icon, type, is_default)
  SELECT NEW.id, 'Other Income', '#607D8B', 'plus-circle', 'income', true
  WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE user_id = NEW.id AND name = 'Other Income');
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create default categories when a new profile is created (only if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'create_default_categories_trigger') THEN
    CREATE TRIGGER create_default_categories_trigger
      AFTER INSERT ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION create_default_categories();
  END IF;
END $$;
