import React from 'react';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export function FloatingActionButton({ onClick, className = '' }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className={`
        fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl 
        transition-all duration-200 z-50 bg-primary hover:bg-primary/90
        ${className}
      `}
    >
      <Plus className="w-6 h-6" />
    </Button>
  );
}