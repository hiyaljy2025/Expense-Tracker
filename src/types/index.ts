export type TransactionType = 'income' | 'expense';

export type RecurrenceFrequency = 'weekly' | 'monthly';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string; // ISO datetime, local
  amount: number;
  category: string;
  account: string;
  note?: string;
  description?: string;
  /** Present when this transaction was generated as part of a recurring series. */
  seriesId?: string;
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
  /** Opening balance per account, used as the base for running balance calculations. */
  accountOpeningBalances: Record<string, number>;
  budget: Budget;
}
