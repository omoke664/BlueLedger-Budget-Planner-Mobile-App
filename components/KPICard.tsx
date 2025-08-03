import React from 'react';
import { Card, CardContent } from './ui/card';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  className?: string;
}

export function KPICard({ title, value, change, changeType = 'neutral', icon: Icon, className = '' }: KPICardProps) {
  const changeColorClass = {
    positive: 'text-green-500',
    negative: 'text-red-500',
    neutral: 'text-muted-foreground'
  };

  return (
    <Card className={`${className}`}>
      <CardContent className="p-grid-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="caption text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-medium text-foreground">{value}</p>
            {change && (
              <p className={`caption mt-1 ${changeColorClass[changeType]}`}>
                {change}
              </p>
            )}
          </div>
          <div className="ml-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}