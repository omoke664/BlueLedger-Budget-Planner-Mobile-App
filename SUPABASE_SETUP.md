# BlueLedger Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `blueledger-budget-planner`
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users
5. Click "Create new project"

## 2. Get Project Credentials

1. Go to Settings > API in your Supabase dashboard
2. Copy the following:
   - Project URL (e.g., `https://your-project-id.supabase.co`)
   - Anon/Public key (starts with `eyJ...`)

## 3. Update Environment Variables

1. Open `BlueLedger-Budget-Planner-Mobile-App/blueledger/app.json`
2. Replace the placeholder values:
   ```json
   "extra": {
     "supabaseUrl": "YOUR_ACTUAL_SUPABASE_URL",
     "supabaseAnonKey": "YOUR_ACTUAL_SUPABASE_ANON_KEY"
   }
   ```

## 4. Run Database Schema

1. Go to SQL Editor in your Supabase dashboard
2. Copy the entire content from `supabase/schema.sql`
3. Paste it into the SQL editor
4. Click "Run" to execute the schema

## 5. Configure Authentication

1. Go to Authentication > Settings in Supabase dashboard
2. Configure the following:
   - Site URL: `exp://localhost:8081` (for development)
   - Redirect URLs: Add your app's redirect URLs
   - Email templates: Customize if needed

## 6. Test the Integration

1. Start your Expo app: `npm start`
2. The app should now show the login screen
3. Try creating a new account
4. Verify that default categories are created automatically

## 7. Database Tables Overview

### Profiles
- Extends Supabase auth.users
- Stores user preferences (currency, timezone, etc.)

### Categories
- User-defined transaction categories
- Includes color and icon for UI
- Default categories created automatically

### Sources
- Transaction sources (bank accounts, cash, etc.)
- Tracks balances and metadata

### Transactions
- Core transaction data
- Links to categories and sources
- Includes metadata for extensibility

### Budgets
- Budget definitions with periods
- Links to categories
- Supports monthly/weekly/yearly periods

### Budget Tracking
- Tracks spending against budgets
- Daily tracking for accurate progress

### Sync Status
- Tracks device sync status
- Useful for offline/online sync

## 8. Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Proper authentication required
- Secure data isolation

## 9. Default Data

The schema automatically creates default categories for new users:
- **Expense Categories**: Food & Dining, Transportation, Shopping, Entertainment, Healthcare, Education, Utilities, Housing
- **Income Categories**: Salary, Freelance, Investment, Other Income

## 10. API Functions

The app includes comprehensive service functions:
- `profileService`: User profile management
- `categoryService`: Category CRUD operations
- `sourceService`: Transaction source management
- `transactionService`: Transaction CRUD operations
- `budgetService`: Budget management
- `budgetTrackingService`: Budget progress tracking
- `analyticsService`: Analytics and reporting

## 11. Next Steps

1. **Test Authentication**: Verify login/register flows
2. **Add Real Data**: Create some test transactions and budgets
3. **Test Analytics**: Verify reports and charts work
4. **Offline Support**: Implement offline data caching
5. **Push Notifications**: Add budget alerts and reminders

## 12. Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Ensure you've updated `app.json` with correct credentials

2. **"Table doesn't exist"**
   - Make sure you've run the complete schema.sql

3. **"RLS policy violation"**
   - Check that user is authenticated
   - Verify RLS policies are properly configured

4. **"Default categories not created"**
   - Check the trigger function exists
   - Verify the trigger is attached to profiles table

### Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Verify network connectivity
3. Check Expo logs for detailed error messages
4. Ensure all dependencies are installed
