import type { AppState } from '../types';

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Food',
  'Grocery',
  'Personal',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Other',
];

export const DEFAULT_INCOME_CATEGORIES = ['Salary', 'Bonus', 'Other Income'];

export const DEFAULT_ACCOUNTS = ['Cash', 'Card'];

export function createDefaultState(): AppState {
  return {
    version: 1,
    transactions: [],
    expenseCategories: DEFAULT_EXPENSE_CATEGORIES,
    incomeCategories: DEFAULT_INCOME_CATEGORIES,
    accounts: DEFAULT_ACCOUNTS,
    accountOpeningBalances: {},
    budget: {},
    reminders: [],
  };
}
