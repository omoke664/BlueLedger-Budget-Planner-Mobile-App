import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Apply CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Apply logger middleware
app.use('*', logger(console.log))

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Helper function to authenticate user
async function authenticateUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1]
  if (!accessToken) {
    return { user: null, error: 'No authorization token provided' }
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  if (error || !user) {
    return { user: null, error: 'Invalid or expired token' }
  }

  return { user, error: null }
}

// Sign Up Route
app.post('/make-server-e384f970/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400)
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (error) {
      console.log('Sign up error:', error)
      return c.json({ error: error.message }, 400)
    }

    // Initialize user data
    await kv.set(`user:${data.user.id}:profile`, {
      name,
      email,
      created_at: new Date().toISOString()
    })

    // Set default budget targets
    await kv.set(`user:${data.user.id}:budgets`, {
      'Food & Dining': 800,
      'Transportation': 600,
      'Shopping': 400,
      'Entertainment': 300,
      'Bills & Utilities': 1000
    })

    // Set default preferences
    await kv.set(`user:${data.user.id}:preferences`, {
      theme: 'light',
      notifications: {
        budgetAlerts: true,
        monthlyReports: true,
        transactionReminders: false
      }
    })

    return c.json({ 
      message: 'User created successfully', 
      user: { id: data.user.id, email: data.user.email, name } 
    })
  } catch (error) {
    console.log('Sign up server error:', error)
    return c.json({ error: 'Internal server error during sign up' }, 500)
  }
})

// Get User Profile
app.get('/make-server-e384f970/profile', async (c) => {
  try {
    const { user, error } = await authenticateUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }

    const profile = await kv.get(`user:${user.id}:profile`)
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404)
    }

    return c.json({ profile })
  } catch (error) {
    console.log('Get profile error:', error)
    return c.json({ error: 'Failed to get user profile' }, 500)
  }
})

// Update User Profile
app.put('/make-server-e384f970/profile', async (c) => {
  try {
    const { user, error } = await authenticateUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }

    const { name, email } = await c.req.json()
    const currentProfile = await kv.get(`user:${user.id}:profile`) || {}

    const updatedProfile = {
      ...currentProfile,
      name: name || currentProfile.name,
      email: email || currentProfile.email,
      updated_at: new Date().toISOString()
    }

    await kv.set(`user:${user.id}:profile`, updatedProfile)
    return c.json({ profile: updatedProfile })
  } catch (error) {
    console.log('Update profile error:', error)
    return c.json({ error: 'Failed to update profile' }, 500)
  }
})

// Get User Transactions
app.get('/make-server-e384f970/transactions', async (c) => {
  try {
    const { user, error } = await authenticateUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }

    const transactions = await kv.getByPrefix(`user:${user.id}:transaction:`)
    const transactionList = transactions.map(item => ({
      id: item.key.split(':').pop(),
      ...item.value
    }))

    // Sort by date (newest first)
    transactionList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return c.json({ transactions: transactionList })
  } catch (error) {
    console.log('Get transactions error:', error)
    return c.json({ error: 'Failed to get transactions' }, 500)
  }
})

// Create Transaction
app.post('/make-server-e384f970/transactions', async (c) => {
  try {
    const { user, error } = await authenticateUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }

    const transactionData = await c.req.json()
    const { amount, type, category, date, description, notes } = transactionData

    if (!amount || !type || !category || !date || !description) {
      return c.json({ error: 'Amount, type, category, date, and description are required' }, 400)
    }

    const transactionId = Date.now().toString()
    const transaction = {
      id: transactionId,
      amount: parseFloat(amount),
      type,
      category,
      date,
      description,
      notes: notes || '',
      created_at: new Date().toISOString()
    }

    await kv.set(`user:${user.id}:transaction:${transactionId}`, transaction)
    return c.json({ transaction })
  } catch (error) {
    console.log('Create transaction error:', error)
    return c.json({ error: 'Failed to create transaction' }, 500)
  }
})

// Update Transaction
app.put('/make-server-e384f970/transactions/:id', async (c) => {
  try {
    const { user, error } = await authenticateUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }

    const transactionId = c.req.param('id')
    const transactionData = await c.req.json()

    const existingTransaction = await kv.get(`user:${user.id}:transaction:${transactionId}`)
    if (!existingTransaction) {
      return c.json({ error: 'Transaction not found' }, 404)
    }

    const updatedTransaction = {
      ...existingTransaction,
      ...transactionData,
      amount: parseFloat(transactionData.amount),
      updated_at: new Date().toISOString()
    }

    await kv.set(`user:${user.id}:transaction:${transactionId}`, updatedTransaction)
    return c.json({ transaction: updatedTransaction })
  } catch (error) {
    console.log('Update transaction error:', error)
    return c.json({ error: 'Failed to update transaction' }, 500)
  }
})

// Delete Transaction
app.delete('/make-server-e384f970/transactions/:id', async (c) => {
  try {
    const { user, error } = await authenticateUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }

    const transactionId = c.req.param('id')
    const existingTransaction = await kv.get(`user:${user.id}:transaction:${transactionId}`)
    
    if (!existingTransaction) {
      return c.json({ error: 'Transaction not found' }, 404)
    }

    await kv.del(`user:${user.id}:transaction:${transactionId}`)
    return c.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    console.log('Delete transaction error:', error)
    return c.json({ error: 'Failed to delete transaction' }, 500)
  }
})

// Get Budget Targets
app.get('/make-server-e384f970/budgets', async (c) => {
  try {
    const { user, error } = await authenticateUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }

    const budgets = await kv.get(`user:${user.id}:budgets`) || {}
    return c.json({ budgets })
  } catch (error) {
    console.log('Get budgets error:', error)
    return c.json({ error: 'Failed to get budgets' }, 500)
  }
})

// Update Budget Targets
app.put('/make-server-e384f970/budgets', async (c) => {
  try {
    const { user, error } = await authenticateUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }

    const { budgets } = await c.req.json()
    await kv.set(`user:${user.id}:budgets`, budgets)
    return c.json({ budgets })
  } catch (error) {
    console.log('Update budgets error:', error)
    return c.json({ error: 'Failed to update budgets' }, 500)
  }
})

// Get User Preferences
app.get('/make-server-e384f970/preferences', async (c) => {
  try {
    const { user, error } = await authenticateUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }

    const preferences = await kv.get(`user:${user.id}:preferences`) || {
      theme: 'light',
      notifications: {
        budgetAlerts: true,
        monthlyReports: true,
        transactionReminders: false
      }
    }
    return c.json({ preferences })
  } catch (error) {
    console.log('Get preferences error:', error)
    return c.json({ error: 'Failed to get preferences' }, 500)
  }
})

// Update User Preferences
app.put('/make-server-e384f970/preferences', async (c) => {
  try {
    const { user, error } = await authenticateUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }

    const { preferences } = await c.req.json()
    await kv.set(`user:${user.id}:preferences`, preferences)
    return c.json({ preferences })
  } catch (error) {
    console.log('Update preferences error:', error)
    return c.json({ error: 'Failed to update preferences' }, 500)
  }
})

// Get Analytics Data
app.get('/make-server-e384f970/analytics', async (c) => {
  try {
    const { user, error } = await authenticateUser(c.req.raw)
    if (error) {
      return c.json({ error }, 401)
    }

    const transactions = await kv.getByPrefix(`user:${user.id}:transaction:`)
    const transactionList = transactions.map(item => item.value)

    // Calculate analytics
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const monthlyTransactions = transactionList.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear
    })

    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    // Category breakdown
    const categoryExpenses = {}
    monthlyTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount
      })

    return c.json({
      totalIncome,
      totalExpenses,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0,
      categoryBreakdown: categoryExpenses,
      transactionCount: monthlyTransactions.length
    })
  } catch (error) {
    console.log('Get analytics error:', error)
    return c.json({ error: 'Failed to get analytics data' }, 500)
  }
})

// Health check endpoint
app.get('/make-server-e384f970/health', (c) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() })
})

Deno.serve(app.fetch)