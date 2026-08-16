import { useMemo } from 'react';
import { X } from 'lucide-react';
import { useTransactions } from '../store/TransactionsContext';
import { groupByDay, sumByType } from '../lib/aggregate';
import { DailyGroupHeader } from '../components/transactions/DailyGroupHeader';
import { TransactionRow } from '../components/transactions/TransactionRow';
import { FloatingAddButton } from '../components/layout/FloatingAddButton';
import type { Transaction } from '../types';

interface Props {
  onAdd: () => void;
  onEdit: (t: Transaction) => void;
  focusDay?: string | null;
  onClearFocus?: () => void;
}

export function DailyTab({ onAdd, onEdit, focusDay, onClearFocus }: Props) {
  const { transactions } = useTransactions();

  const groups = useMemo(() => {
    const map = groupByDay(transactions);
    return Array.from(map.entries())
      .filter(([key]) => !focusDay || key === focusDay)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, list]) => ({
        date: new Date(list[0].date),
        key,
        list: list.slice().sort((a, b) => b.date.localeCompare(a.date)),
      }));
  }, [transactions, focusDay]);

  return (
    <div className="pb-24">
      {focusDay && (
        <div className="flex items-center justify-between bg-red-50 px-4 py-2 text-xs text-expense">
          <span>Showing transactions for {focusDay}</span>
          <button onClick={onClearFocus} className="flex items-center gap-1 font-medium">
            <X size={14} /> Clear
          </button>
        </div>
      )}
      {groups.length === 0 && (
        <div className="px-4 py-12 text-center text-sm text-gray-400">
          {focusDay ? 'No transactions on this day.' : 'No transactions yet. Tap + to add one.'}
        </div>
      )}
      {groups.map((group) => (
        <div key={group.key} className="mb-2 bg-white">
          <DailyGroupHeader date={group.date} totals={sumByType(group.list)} />
          <div className="divide-y divide-gray-100">
            {group.list.map((t) => (
              <TransactionRow key={t.id} transaction={t} onClick={() => onEdit(t)} />
            ))}
          </div>
        </div>
      ))}
      <FloatingAddButton onClick={onAdd} />
    </div>
  );
}
