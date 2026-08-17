import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type { AppState, BillReminder, Transaction } from '../types';
import { loadState, saveState } from '../lib/storage';
import { createId } from '../lib/id';
import { dayKey, parseDateInputValue } from '../lib/dateUtils';
import { advanceDueDate } from '../lib/reminders';

type CategoryKind = 'expense' | 'income';

type Action =
  | { kind: 'add'; transaction: Omit<Transaction, 'id'> }
  | { kind: 'addMany'; transactions: Transaction[] }
  | { kind: 'update'; transaction: Transaction }
  | { kind: 'remove'; id: string }
  | { kind: 'removeSeries'; seriesId: string }
  | { kind: 'addForecastEntry'; entry: Omit<Transaction, 'id'> }
  | { kind: 'addForecastMany'; entries: Transaction[] }
  | { kind: 'updateForecastEntry'; entry: Transaction }
  | { kind: 'removeForecastEntry'; id: string }
  | { kind: 'removeForecastSeries'; seriesId: string }
  | { kind: 'setBudget'; monthly: number | undefined }
  | { kind: 'setYearlyBudget'; yearly: number | undefined }
  | { kind: 'addCategory'; categoryKind: CategoryKind; name: string }
  | { kind: 'renameCategory'; categoryKind: CategoryKind; oldName: string; newName: string }
  | { kind: 'removeCategory'; categoryKind: CategoryKind; name: string }
  | { kind: 'addAccount'; name: string; openingBalance: number }
  | { kind: 'renameAccount'; oldName: string; newName: string }
  | { kind: 'removeAccount'; name: string }
  | { kind: 'setAccountOpeningBalance'; name: string; balance: number }
  | { kind: 'addReminder'; reminder: Omit<BillReminder, 'id'> }
  | { kind: 'updateReminder'; reminder: BillReminder }
  | { kind: 'removeReminder'; id: string }
  | { kind: 'markReminderPaid'; id: string; paidDate: string }
  | { kind: 'replace'; state: AppState };

function renameInList(list: string[], oldName: string, newName: string): string[] {
  return list.map((c) => (c === oldName ? newName : c));
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.kind) {
    case 'add':
      return {
        ...state,
        transactions: [...state.transactions, { ...action.transaction, id: createId() }],
      };
    case 'addMany':
      return { ...state, transactions: [...state.transactions, ...action.transactions] };
    case 'update':
      return {
        ...state,
        transactions: state.transactions.map((t) => (t.id === action.transaction.id ? action.transaction : t)),
      };
    case 'remove':
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.id) };
    case 'removeSeries':
      return { ...state, transactions: state.transactions.filter((t) => t.seriesId !== action.seriesId) };
    case 'addForecastEntry':
      return {
        ...state,
        forecastEntries: [...state.forecastEntries, { ...action.entry, id: createId() }],
      };
    case 'addForecastMany':
      return { ...state, forecastEntries: [...state.forecastEntries, ...action.entries] };
    case 'updateForecastEntry':
      return {
        ...state,
        forecastEntries: state.forecastEntries.map((t) => (t.id === action.entry.id ? action.entry : t)),
      };
    case 'removeForecastEntry':
      return { ...state, forecastEntries: state.forecastEntries.filter((t) => t.id !== action.id) };
    case 'removeForecastSeries':
      return { ...state, forecastEntries: state.forecastEntries.filter((t) => t.seriesId !== action.seriesId) };
    case 'setBudget':
      return { ...state, budget: { ...state.budget, monthly: action.monthly } };
    case 'setYearlyBudget':
      return { ...state, budget: { ...state.budget, yearly: action.yearly } };
    case 'addCategory': {
      const key = action.categoryKind === 'expense' ? 'expenseCategories' : 'incomeCategories';
      if (state[key].includes(action.name)) return state;
      return { ...state, [key]: [...state[key], action.name] };
    }
    case 'renameCategory': {
      const key = action.categoryKind === 'expense' ? 'expenseCategories' : 'incomeCategories';
      return {
        ...state,
        [key]: renameInList(state[key], action.oldName, action.newName),
        transactions: state.transactions.map((t) =>
          t.category === action.oldName ? { ...t, category: action.newName } : t,
        ),
        forecastEntries: state.forecastEntries.map((t) =>
          t.category === action.oldName ? { ...t, category: action.newName } : t,
        ),
      };
    }
    case 'removeCategory': {
      const key = action.categoryKind === 'expense' ? 'expenseCategories' : 'incomeCategories';
      return { ...state, [key]: state[key].filter((c) => c !== action.name) };
    }
    case 'addAccount': {
      if (state.accounts.includes(action.name)) return state;
      return {
        ...state,
        accounts: [...state.accounts, action.name],
        accountOpeningBalances: { ...state.accountOpeningBalances, [action.name]: action.openingBalance },
      };
    }
    case 'renameAccount': {
      const { [action.oldName]: oldBalance, ...restBalances } = state.accountOpeningBalances;
      return {
        ...state,
        accounts: renameInList(state.accounts, action.oldName, action.newName),
        accountOpeningBalances: { ...restBalances, [action.newName]: oldBalance ?? 0 },
        transactions: state.transactions.map((t) =>
          t.account === action.oldName ? { ...t, account: action.newName } : t,
        ),
        forecastEntries: state.forecastEntries.map((t) =>
          t.account === action.oldName ? { ...t, account: action.newName } : t,
        ),
      };
    }
    case 'removeAccount': {
      const { [action.name]: _removed, ...restBalances } = state.accountOpeningBalances;
      return {
        ...state,
        accounts: state.accounts.filter((a) => a !== action.name),
        accountOpeningBalances: restBalances,
      };
    }
    case 'setAccountOpeningBalance':
      return {
        ...state,
        accountOpeningBalances: { ...state.accountOpeningBalances, [action.name]: action.balance },
      };
    case 'addReminder':
      return { ...state, reminders: [...state.reminders, { ...action.reminder, id: createId() }] };
    case 'updateReminder':
      return {
        ...state,
        reminders: state.reminders.map((r) => (r.id === action.reminder.id ? action.reminder : r)),
      };
    case 'removeReminder':
      return { ...state, reminders: state.reminders.filter((r) => r.id !== action.id) };
    case 'markReminderPaid': {
      const reminder = state.reminders.find((r) => r.id === action.id);
      if (!reminder) return state;
      const paidTransaction: Transaction = {
        id: createId(),
        type: 'expense',
        date: new Date(action.paidDate).toISOString(),
        amount: reminder.amount,
        category: reminder.category,
        account: reminder.account,
        note: reminder.name,
      };
      if (reminder.frequency === 'once') {
        return {
          ...state,
          transactions: [...state.transactions, paidTransaction],
          reminders: state.reminders.filter((r) => r.id !== action.id),
        };
      }
      const nextDueDate = dayKey(advanceDueDate(parseDateInputValue(reminder.dueDate), reminder.frequency));
      return {
        ...state,
        transactions: [...state.transactions, paidTransaction],
        reminders: state.reminders.map((r) => (r.id === action.id ? { ...r, dueDate: nextDueDate } : r)),
      };
    }
    case 'replace':
      return action.state;
    default:
      return state;
  }
}

interface TransactionsContextValue extends AppState {
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addTransactionSeries: (transactions: Transaction[]) => void;
  updateTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
  removeSeries: (seriesId: string) => void;
  addForecastEntry: (entry: Omit<Transaction, 'id'>) => void;
  addForecastSeries: (entries: Transaction[]) => void;
  updateForecastEntry: (entry: Transaction) => void;
  removeForecastEntry: (id: string) => void;
  removeForecastSeries: (seriesId: string) => void;
  setBudget: (monthly: number | undefined) => void;
  setYearlyBudget: (yearly: number | undefined) => void;
  addCategory: (kind: CategoryKind, name: string) => void;
  renameCategory: (kind: CategoryKind, oldName: string, newName: string) => void;
  removeCategory: (kind: CategoryKind, name: string) => void;
  addAccount: (name: string, openingBalance?: number) => void;
  renameAccount: (oldName: string, newName: string) => void;
  removeAccount: (name: string) => void;
  setAccountOpeningBalance: (name: string, balance: number) => void;
  addReminder: (reminder: Omit<BillReminder, 'id'>) => void;
  updateReminder: (reminder: BillReminder) => void;
  removeReminder: (id: string) => void;
  markReminderPaid: (id: string, paidDate?: string) => void;
  replaceState: (state: AppState) => void;
}

const TransactionsContext = createContext<TransactionsContextValue | null>(null);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const value: TransactionsContextValue = {
    ...state,
    addTransaction: (transaction) => dispatch({ kind: 'add', transaction }),
    addTransactionSeries: (transactions) => dispatch({ kind: 'addMany', transactions }),
    updateTransaction: (transaction) => dispatch({ kind: 'update', transaction }),
    removeTransaction: (id) => dispatch({ kind: 'remove', id }),
    removeSeries: (seriesId) => dispatch({ kind: 'removeSeries', seriesId }),
    addForecastEntry: (entry) => dispatch({ kind: 'addForecastEntry', entry }),
    addForecastSeries: (entries) => dispatch({ kind: 'addForecastMany', entries }),
    updateForecastEntry: (entry) => dispatch({ kind: 'updateForecastEntry', entry }),
    removeForecastEntry: (id) => dispatch({ kind: 'removeForecastEntry', id }),
    removeForecastSeries: (seriesId) => dispatch({ kind: 'removeForecastSeries', seriesId }),
    setBudget: (monthly) => dispatch({ kind: 'setBudget', monthly }),
    setYearlyBudget: (yearly) => dispatch({ kind: 'setYearlyBudget', yearly }),
    addCategory: (categoryKind, name) => dispatch({ kind: 'addCategory', categoryKind, name }),
    renameCategory: (categoryKind, oldName, newName) =>
      dispatch({ kind: 'renameCategory', categoryKind, oldName, newName }),
    removeCategory: (categoryKind, name) => dispatch({ kind: 'removeCategory', categoryKind, name }),
    addAccount: (name, openingBalance = 0) => dispatch({ kind: 'addAccount', name, openingBalance }),
    renameAccount: (oldName, newName) => dispatch({ kind: 'renameAccount', oldName, newName }),
    removeAccount: (name) => dispatch({ kind: 'removeAccount', name }),
    setAccountOpeningBalance: (name, balance) => dispatch({ kind: 'setAccountOpeningBalance', name, balance }),
    addReminder: (reminder) => dispatch({ kind: 'addReminder', reminder }),
    updateReminder: (reminder) => dispatch({ kind: 'updateReminder', reminder }),
    removeReminder: (id) => dispatch({ kind: 'removeReminder', id }),
    markReminderPaid: (id, paidDate) =>
      dispatch({ kind: 'markReminderPaid', id, paidDate: paidDate ?? new Date().toISOString() }),
    replaceState: (newState) => dispatch({ kind: 'replace', state: newState }),
  };

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
}

export function useTransactions(): TransactionsContextValue {
  const ctx = useContext(TransactionsContext);
  if (!ctx) throw new Error('useTransactions must be used within TransactionsProvider');
  return ctx;
}

export type { CategoryKind };
