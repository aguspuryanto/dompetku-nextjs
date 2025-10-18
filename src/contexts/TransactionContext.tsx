// src/contexts/TransactionContext.tsx
'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { 
  fetchTransactions,
  addTransaction as addTransactionToStorage,
  updateTransaction as updateTransactionInStorage,
  deleteTransaction as deleteTransactionInStorage,
} from '@/lib/fileStorage';
import { Transaction } from '@/types/transaction';

interface TransactionContextType {
  transactions: Transaction[];
  isLoading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<boolean>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load transactions on mount
  useEffect(() => {
    const loadTransactions = async () => {
      setIsLoading(true);
      try {
        const data = await fetchTransactions();
        setTransactions(data || []);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, []);

  // Add a new transaction
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const success = await addTransactionToStorage(transaction);
      if (success) {
        const newTransaction = {
          ...transaction,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        setTransactions(prev => [...prev, newTransaction]);
      }
      return success;
    } catch (error) {
      console.error('Error adding transaction:', error);
      return false;
    }
  };

  // Update a transaction
  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const success = await updateTransactionInStorage(id, updates);
      if (success) {
        setTransactions(prev => 
          prev.map(t => t.id === id ? { ...t, ...updates } : t)
        );
      }
      return success;
    } catch (error) {
      console.error('Error updating transaction:', error);
      return false;
    }
  };

  // Delete a transaction
  const deleteTransaction = async (id: string) => {
    try {
      const success = await deleteTransactionInStorage(id);
      if (success) {
        setTransactions(prev => prev.filter(t => t.id !== id));
      }
      return success;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        isLoading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};