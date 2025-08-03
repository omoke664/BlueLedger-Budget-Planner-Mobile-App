import React, { useState } from 'react';
import { Input } from '../ui/input';
import { TransactionItem } from '../TransactionItem';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Search, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { 
  ShoppingBag, 
  Car, 
  Home, 
  Coffee, 
  Gamepad2, 
  DollarSign,
  Briefcase,
  Heart,
  Book,
  Plane,
  MoreHorizontal
} from 'lucide-react';

interface TransactionsScreenProps {
  transactions: any[];
  onBack: () => void;
  onEditTransaction: (transactionId: string) => void;
  onDeleteTransaction: (transactionId: string) => void;
}

// Category icon mapping
const categoryIcons: Record<string, any> = {
  'Food & Dining': Coffee,
  'Transportation': Car,
  'Shopping': ShoppingBag,
  'Entertainment': Gamepad2,
  'Bills & Utilities': Home,
  'Healthcare': Heart,
  'Education': Book,
  'Travel': Plane,
  'Salary': Briefcase,
  'Freelance': DollarSign,
  'Business': Briefcase,
  'Investment': DollarSign,
  'Gift': Heart,
  'Refund': DollarSign,
  'Other': MoreHorizontal
};

export function TransactionsScreen({ 
  transactions, 
  onBack, 
  onEditTransaction, 
  onDeleteTransaction 
}: TransactionsScreenProps) {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.type === filter;
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category] || MoreHorizontal;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-grid-3">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-medium">Transactions</h1>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expenses</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="p-grid-3 pb-6">
        {filteredTransactions.length > 0 ? (
          <div className="space-y-2">
            {/* Group by date for better organization */}
            {filteredTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                id={transaction.id}
                date={formatDate(transaction.date)}
                category={transaction.category}
                categoryIcon={getCategoryIcon(transaction.category)}
                description={transaction.description}
                amount={transaction.amount}
                type={transaction.type}
                onClick={() => onEditTransaction(transaction.id)}
                onDelete={() => onDeleteTransaction(transaction.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {searchQuery || filter !== 'all' ? 'No transactions found' : 'No transactions yet'}
            </p>
            <p className="caption text-muted-foreground mt-1">
              {searchQuery || filter !== 'all' 
                ? 'Try adjusting your search or filter' 
                : 'Add your first transaction to get started'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}