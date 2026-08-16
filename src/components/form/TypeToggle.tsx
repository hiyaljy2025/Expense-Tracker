import type { TransactionType } from '../../types';

export function TypeToggle({ value, onChange }: { value: TransactionType; onChange: (v: TransactionType) => void }) {
  return (
    <div className="flex gap-2 p-4">
      <button
        onClick={() => onChange('income')}
        className={`flex-1 rounded-lg border py-2 text-sm font-medium ${
          value === 'income' ? 'border-income bg-income-light text-income' : 'border-gray-200 text-gray-500'
        }`}
      >
        Income
      </button>
      <button
        onClick={() => onChange('expense')}
        className={`flex-1 rounded-lg border py-2 text-sm font-medium ${
          value === 'expense' ? 'border-expense bg-expense-light text-expense' : 'border-gray-200 text-gray-500'
        }`}
      >
        Expense
      </button>
    </div>
  );
}
