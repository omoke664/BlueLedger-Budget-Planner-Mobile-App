# BlueLedger

A comprehensive mobile-first budget planner application built with React, TypeScript, and Supabase. BlueLedger helps users manage their finances with real-time analytics, transaction tracking, and intelligent insights.

![BlueLedger Banner](https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=400&fit=crop&crop=center)

## ✨ Features

### 🔐 **Authentication & Security**
- Secure user registration and login
- Session management with Supabase Auth
- Protected routes and data isolation

### 💰 **Transaction Management**
- Add, edit, and delete income/expense transactions
- Categorized transactions with custom categories
- Date-based transaction filtering and sorting
- Detailed transaction notes and descriptions

### 📊 **Real-time Analytics**
- Interactive charts and visualizations using Recharts
- Income vs expenses bar charts
- Spending trends line charts
- Category breakdown pie charts
- Monthly, weekly, and yearly analytics views

### 🎯 **Budget Tracking**
- Set budget targets by category
- Track spending against budgets
- Visual progress indicators
- Budget alerts and notifications

### 🌙 **Theme System**
- Light and dark mode support
- BlueLedger design system with consistent colors
- Smooth theme transitions
- Persistent theme preferences

### 📱 **Mobile-First Design**
- Responsive design optimized for mobile devices
- Touch-friendly interface elements
- Bottom navigation for easy access
- Floating action button for quick transaction entry

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Charts**: Recharts for data visualization
- **Backend**: Supabase (Database, Auth, Real-time)
- **State Management**: React Hooks (useState, useEffect)
- **Build Tool**: Vite
- **Deployment**: Figma Make platform

## 🏗️ Architecture

```
├── components/
│   ├── screens/          # Main application screens
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   └── [custom]/        # Custom components (KPICard, etc.)
├── utils/
│   └── supabase/        # Supabase client configuration
├── styles/
│   └── globals.css      # Global styles and design tokens
└── supabase/
    └── functions/       # Server-side functions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/blueledger.git
   cd blueledger
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Update the Supabase configuration in `utils/supabase/client.tsx`

4. **Configure environment variables**
   ```bash
   # Create .env.local file
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

### Database Setup

The application uses Supabase's built-in authentication and a key-value store for data persistence. The server functions handle:

- User profiles and preferences
- Transaction CRUD operations
- Budget targets and analytics
- Real-time data synchronization

## 📱 Application Screens

### 🏠 Dashboard
- Overview of financial status
- KPI cards for income, expenses, and savings rate
- Recent transactions list
- Quick access to analytics

### 💳 Transactions
- Complete transaction history
- Search and filter capabilities
- Edit and delete transactions
- Category-based organization

### 📈 Analytics
- Interactive charts and graphs
- Time-based filtering (week/month/year)
- Category spending breakdown
- Trend analysis and insights

### ⚙️ Settings
- Profile management
- Theme switching (light/dark)
- Budget target configuration
- Notification preferences

## 🎨 Design System

BlueLedger follows a comprehensive design system:

- **Colors**: Primary dark blue (#0A1F44) with white accents
- **Typography**: Inter font family with consistent hierarchy
- **Spacing**: 8px grid system for consistent layouts
- **Components**: shadcn/ui components with custom styling
- **Icons**: Lucide React for consistent iconography

## 🔧 Configuration

### Theme Customization

The theme system is defined in `styles/globals.css` with CSS custom properties:

```css
:root {
  --primary: #0A1F44;
  --background: #ffffff;
  --foreground: #0A1F44;
  /* ... more tokens */
}

.dark {
  --primary: #ffffff;
  --background: #0A1F44;
  --foreground: #ffffff;
  /* ... dark mode overrides */
}
```

### Adding New Categories

Transaction categories can be customized in the transaction forms. The application supports:

- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Travel
- Education
- And more...

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Use TypeScript for type safety
- Write descriptive commit messages
- Test your changes across different screen sizes
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [Recharts](https://recharts.org/) for data visualization
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for icons

## 📞 Support

If you have any questions or need help with the project:

- Open an [issue](https://github.com/yourusername/blueledger/issues)
- Check the [documentation](https://github.com/yourusername/blueledger/wiki)
- Contact the maintainers

---

**Built with ❤️ using React and Supabase**