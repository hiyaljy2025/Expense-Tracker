export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string; // ISO datetime, local
  amount: number;
  category: string;
  account: string;
  note?: string;
  description?: string;
}

export interface Budget {
  monthly?: number;
}

export interface AppState {
  version: 1;
  transactions: Transaction[];
  expenseCategories: string[];
  incomeCategories: string[];
  accounts: string[];
  budget: Budget;
}
