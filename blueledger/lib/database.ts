import { supabase } from './supabase';
import { Transaction, Budget, Profile, Category, Source, BudgetTracking } from './supabase';

// Profile functions
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Category functions
export const categoryService = {
  async getCategories(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Source functions
export const sourceService = {
  async getSources(userId: string): Promise<Source[]> {
    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createSource(source: Omit<Source, 'id' | 'created_at' | 'updated_at'>): Promise<Source> {
    const { data, error } = await supabase
      .from('sources')
      .insert([source])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSource(id: string, updates: Partial<Source>): Promise<Source> {
    const { data, error } = await supabase
      .from('sources')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSource(id: string): Promise<void> {
    const { error } = await supabase
      .from('sources')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },
};

// Transaction functions
export const transactionService = {
  async getTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        category:categories(name, color, icon),
        source:sources(name, type)
      `)
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTransactionByCode(userId: string, transactionCode: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('metadata->>transactionCode', transactionCode)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data;
  },

  async getSimilarTransaction(userId: string, amount: number, timestamp: Date, merchant: string | undefined): Promise<Transaction | null> {
    if (!merchant) return null;
    const timeWindow = 60 * 1000; // 60 seconds
    const startTime = new Date(timestamp.getTime() - timeWindow).toISOString();
    const endTime = new Date(timestamp.getTime() + timeWindow).toISOString();

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('amount', amount)
      .eq('merchant', merchant)
      .gte('timestamp', startTime)
      .lte('timestamp', endTime)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Budget functions
export const budgetService = {
  async getBudgets(userId: string): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        category:categories(name, color, icon)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createBudget(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .insert([budget])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBudget(id: string): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },
};

// Budget tracking functions
export const budgetTrackingService = {
  async getBudgetTracking(budgetId: string, startDate: string, endDate: string): Promise<BudgetTracking[]> {
    const { data, error } = await supabase
      .from('budget_tracking')
      .select('*')
      .eq('budget_id', budgetId)
      .gte('tracking_date', startDate)
      .lte('tracking_date', endDate)
      .order('tracking_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async updateBudgetTracking(budgetId: string, date: string, spentAmount: number): Promise<BudgetTracking> {
    const { data, error } = await supabase
      .from('budget_tracking')
      .upsert({
        budget_id: budgetId,
        tracking_date: date,
        spent_amount: spentAmount,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Analytics functions
export const analyticsService = {
  async getMonthlyStats(userId: string, month: string, year: number) {
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-31`;

    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount, currency')
      .eq('user_id', userId)
      .gte('timestamp', startDate)
      .lte('timestamp', endDate);

    if (error) throw error;

    const income = data?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
    const expenses = data?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;

    return {
      income,
      expenses,
      savings: income - expenses,
      transactionCount: data?.length || 0,
    };
  },

  async getCategoryStats(userId: string, month: string, year: number) {
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-31`;

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        category_id,
        amount,
        type,
        category:categories(name, color, icon)
      `)
      .eq('user_id', userId)
      .gte('timestamp', startDate)
      .lte('timestamp', endDate);

    if (error) throw error;

    const categoryStats: Record<string, { income: number; expenses: number; name: string; color: string; icon: string }> = {};
    
    data?.forEach(transaction => {
      const categoryName = transaction.category?.name || 'Uncategorized';
      const categoryColor = transaction.category?.color || '#6C757D';
      const categoryIcon = transaction.category?.icon || 'tag';
      
      if (!categoryStats[categoryName]) {
        categoryStats[categoryName] = { 
          income: 0, 
          expenses: 0, 
          name: categoryName,
          color: categoryColor,
          icon: categoryIcon
        };
      }
      
      if (transaction.type === 'income') {
        categoryStats[categoryName].income += transaction.amount;
      } else {
        categoryStats[categoryName].expenses += transaction.amount;
      }
    });

    return categoryStats;
  },

  async getBudgetProgress(userId: string, month: string, year: number) {
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-31`;

    const { data: budgets, error: budgetsError } = await supabase
      .from('budgets')
      .select(`
        *,
        category:categories(name, color, icon)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .lte('start_date', endDate)
      .gte('end_date', startDate);

    if (budgetsError) throw budgetsError;
    if (!budgets) return [];

    const categoryIds = budgets.map(b => b.category_id);

    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('category_id, amount')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .in('category_id', categoryIds)
      .gte('timestamp', startDate)
      .lte('timestamp', endDate);

    if (transactionsError) throw transactionsError;

    const spentByCategory: Record<string, number> = {};
    transactions?.forEach(t => {
      if (t.category_id) {
        if (!spentByCategory[t.category_id]) {
          spentByCategory[t.category_id] = 0;
        }
        spentByCategory[t.category_id] += t.amount;
      }
    });

    const budgetProgress = budgets.map(budget => {
      const totalSpent = spentByCategory[budget.category_id] || 0;
      const progress = (totalSpent / budget.amount) * 100;

      return {
        ...budget,
        spent: totalSpent,
        progress: Math.min(progress, 100),
        remaining: Math.max(budget.amount - totalSpent, 0),
      };
    });

    return budgetProgress;
  },
};
