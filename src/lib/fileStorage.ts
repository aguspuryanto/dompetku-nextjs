// src/lib/storage.ts
import { Transaction } from '@/types/transaction';

const STORAGE_KEY = 'transactions';

// Client-side storage using localStorage as a fallback
export const getLocalTransactions = (): Transaction[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

export const saveLocalTransactions = (transactions: Transaction[]): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

// API-based storage
const API_BASE = '/api';

export const fetchTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await fetch(`${API_BASE}/transactions`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return await response.json();
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return getLocalTransactions(); // Fallback to local storage
  }
};

export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(errorData.error || 'Failed to add transaction');
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Error in addTransaction:', error);
    // Fallback to local storage
    console.log('Falling back to localStorage');
    const transactions = getLocalTransactions();
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    return saveLocalTransactions([...transactions, newTransaction as Transaction]);
  }
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) throw new Error('Failed to update transaction');
    return true;
  } catch (error) {
    console.error('Error updating transaction:', error);
    // Fallback to local storage
    const transactions = getLocalTransactions();
    const updated = transactions.map(t => 
      t.id === id ? { ...t, ...updates } : t
    );
    return saveLocalTransactions(updated);
  }
};

export const deleteTransaction = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete transaction');
    return true;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    // Fallback to local storage
    const transactions = getLocalTransactions();
    return saveLocalTransactions(transactions.filter(t => t.id !== id));
  }
};