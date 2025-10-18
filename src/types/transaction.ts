export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TransactionFormData {
  type: 'income' | 'expense';
  category: string;
  amount: string;
  date: string;
  notes?: string;
}

export interface TransactionSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
}

export type TransactionInput = Omit<Transaction, 'id' | 'date'>;