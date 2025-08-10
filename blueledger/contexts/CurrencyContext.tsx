import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  position: 'before' | 'after';
}

export const currencies: Currency[] = [
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', position: 'before' },
  { code: 'USD', symbol: '$', name: 'US Dollar', position: 'before' },
  { code: 'EUR', symbol: '€', name: 'Euro', position: 'before' },
  { code: 'GBP', symbol: '£', name: 'British Pound', position: 'before' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', position: 'before' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', position: 'before' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', position: 'before' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', position: 'before' },
];

interface CurrencyContextType {
  selectedCurrency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number, showDecimals?: boolean) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0]); // KES as default

  const setCurrency = (currency: Currency) => {
    setSelectedCurrency(currency);
  };

  const formatCurrency = (amount: number, showDecimals: boolean = true): string => {
    const formattedAmount = showDecimals 
      ? amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : amount.toLocaleString('en-KE', { maximumFractionDigits: 0 });

    if (selectedCurrency.position === 'before') {
      return `${selectedCurrency.symbol}${formattedAmount}`;
    } else {
      return `${formattedAmount} ${selectedCurrency.symbol}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{
      selectedCurrency,
      setCurrency,
      formatCurrency,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
