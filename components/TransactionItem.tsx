import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { SwipeToDelete } from './SwipeToDelete';
import { motion } from 'motion/react';

interface TransactionItemProps {
  id: string;
  date: string;
  category: string;
  categoryIcon: React.ComponentType<{ className?: string }>;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  onClick: () => void;
  onDelete: () => void;
}

export function TransactionItem({
  id,
  date,
  category,
  categoryIcon: CategoryIcon,
  description,
  amount,
  type,
  onClick,
  onDelete,
}: TransactionItemProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <SwipeToDelete onDelete={onDelete} className="mb-2">
      <motion.div
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={onClick}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {/* Category Icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                type === 'income' 
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                  : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                <CategoryIcon className="w-5 h-5" />
              </div>

              {/* Transaction Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-foreground truncate pr-2">
                    {description}
                  </h3>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-medium ${
                      type === 'income' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {type === 'income' ? '+' : '-'}
                      {formatCurrency(Math.abs(amount))}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className="caption px-2 py-0.5"
                    >
                      {category}
                    </Badge>
                    <span className="caption text-muted-foreground">
                      {date}
                    </span>
                  </div>
                  
                  {/* Swipe indicator */}
                  <div className="flex gap-1 opacity-30">
                    <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                    <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                    <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </SwipeToDelete>
  );
}