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

export type BillFrequency = 'once' | 'weekly' | 'monthly' | 'yearly';

export interface BillReminder {
  id: string;
  name: string;
  amount: number;
  category: string;
  account: string;
  frequency: BillFrequency;
  dueDate: string; // yyyy-mm-dd, local, the next unpaid due date
  note?: string;
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
  reminders: BillReminder[];
}
