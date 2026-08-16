import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type { AppState, Transaction } from '../types';
import { loadState, saveState } from '../lib/storage';
import { createId } from '../lib/id';

type Action =
  | { kind: 'add'; transaction: Omit<Transaction, 'id'> }
  | { kind: 'update'; transaction: Transaction }
  | { kind: 'remove'; id: string }
  | { kind: 'setBudget'; monthly: number | undefined };

function reducer(state: AppState, action: Action): AppState {
  switch (action.kind) {
    case 'add':
      return {
        ...state,
        transactions: [...state.transactions, { ...action.transaction, id: createId() }],
      };
    case 'update':
      return {
        ...state,
        transactions: state.transactions.map((t) => (t.id === action.transaction.id ? action.transaction : t)),
      };
    case 'remove':
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.id) };
    case 'setBudget':
      return { ...state, budget: { monthly: action.monthly } };
    default:
      return state;
  }
}

interface TransactionsContextValue extends AppState {
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
  setBudget: (monthly: number | undefined) => void;
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
    updateTransaction: (transaction) => dispatch({ kind: 'update', transaction }),
    removeTransaction: (id) => dispatch({ kind: 'remove', id }),
    setBudget: (monthly) => dispatch({ kind: 'setBudget', monthly }),
  };

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
}

export function useTransactions(): TransactionsContextValue {
  const ctx = useContext(TransactionsContext);
  if (!ctx) throw new Error('useTransactions must be used within TransactionsProvider');
  return ctx;
}
