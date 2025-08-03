import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
)

// API base URL for server functions
export const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e384f970`

// Helper function to make authenticated API calls
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': session?.access_token ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`,
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }))
    throw new Error(errorData.error || `HTTP ${response.status}`)
  }

  return response.json()
}

// Authentication helpers
export const auth = {
  signUp: async (email: string, password: string, name: string) => {
    try {
      // First try using Supabase built-in auth for better reliability
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      })

      if (error) {
        console.error('Supabase signup error:', error)
        throw new Error(error.message)
      }

      // If successful, try to initialize user profile via our server
      try {
        const response = await fetch(`${API_BASE_URL}/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name })
        })

        // If server call fails, that's okay - we'll create the profile on first login
        if (!response.ok) {
          console.warn('Server profile creation failed, will create on login')
        }
      } catch (serverError) {
        console.warn('Server profile creation failed:', serverError)
        // Continue anyway - profile will be created on login
      }

      return data
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Try to ensure user profile exists after successful login
    if (data.session?.user) {
      try {
        await apiCall('/profile')
      } catch (profileError) {
        // If profile doesn't exist, try to create it
        try {
          const userName = data.user?.user_metadata?.name || data.user?.email?.split('@')[0] || 'User'
          await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.session.access_token}`
            },
            body: JSON.stringify({ 
              email: data.user.email, 
              password: '', // Don't need password for profile creation
              name: userName 
            })
          })
        } catch (createError) {
          console.warn('Could not create user profile:', createError)
        }
      }
    }

    return data
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }
}

// API service functions with better error handling
export const api = {
  // Profile
  getProfile: async () => {
    try {
      return await apiCall('/profile')
    } catch (error) {
      // If profile doesn't exist, create a default one
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const defaultProfile = {
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          email: user.email
        }
        
        try {
          await apiCall('/profile', {
            method: 'PUT',
            body: JSON.stringify(defaultProfile)
          })
          return { profile: defaultProfile }
        } catch (createError) {
          console.error('Could not create profile:', createError)
          return { profile: defaultProfile }
        }
      }
      throw error
    }
  },
  
  updateProfile: (data: any) => apiCall('/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Transactions
  getTransactions: async () => {
    try {
      return await apiCall('/transactions')
    } catch (error) {
      console.warn('Could not load transactions:', error)
      return { transactions: [] }
    }
  },
  
  createTransaction: (data: any) => apiCall('/transactions', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateTransaction: (id: string, data: any) => apiCall(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteTransaction: (id: string) => apiCall(`/transactions/${id}`, {
    method: 'DELETE'
  }),

  // Budgets
  getBudgets: async () => {
    try {
      return await apiCall('/budgets')
    } catch (error) {
      console.warn('Could not load budgets:', error)
      return { budgets: {} }
    }
  },
  
  updateBudgets: (budgets: any) => apiCall('/budgets', {
    method: 'PUT',
    body: JSON.stringify({ budgets })
  }),

  // Preferences
  getPreferences: async () => {
    try {
      return await apiCall('/preferences')
    } catch (error) {
      console.warn('Could not load preferences:', error)
      return { 
        preferences: {
          theme: 'light',
          notifications: {
            budgetAlerts: true,
            monthlyReports: true,
            transactionReminders: false
          }
        }
      }
    }
  },
  
  updatePreferences: (preferences: any) => apiCall('/preferences', {
    method: 'PUT',
    body: JSON.stringify({ preferences })
  }),

  // Analytics
  getAnalytics: async () => {
    try {
      return await apiCall('/analytics')
    } catch (error) {
      console.warn('Could not load analytics:', error)
      return {
        totalIncome: 0,
        totalExpenses: 0,
        savingsRate: 0,
        categoryBreakdown: {},
        transactionCount: 0
      }
    }
  }
}