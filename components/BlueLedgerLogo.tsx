import React from 'react';

interface BlueLedgerLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function BlueLedgerLogo({ size = 'md', showText = true, className = '' }: BlueLedgerLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`
        ${sizeClasses[size]} 
        bg-primary text-primary-foreground 
        rounded-lg flex items-center justify-center 
        font-medium shadow-sm
      `}>
        <span className={textSizeClasses[size]}>BL</span>
      </div>
      {showText && (
        <span className={`font-medium text-foreground ${textSizeClasses[size]}`}>
          BlueLedger
        </span>
      )}
    </div>
  );
}