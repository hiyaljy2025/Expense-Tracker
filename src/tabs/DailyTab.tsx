import { useMemo } from 'react';
import { useTransactions } from '../store/TransactionsContext';
import { groupByDay, sumByType } from '../lib/aggregate';
import { DailyGroupHeader } from '../components/transactions/DailyGroupHeader';
import { TransactionRow } from '../components/transactions/TransactionRow';
import { FloatingAddButton } from '../components/layout/FloatingAddButton';
import type { Transaction } from '../types';

export function DailyTab({ onAdd, onEdit }: { onAdd: () => void; onEdit: (t: Transaction) => void }) {
  const { transactions } = useTransactions();

  const groups = useMemo(() => {
    const map = groupByDay(transactions);
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, list]) => ({
        date: new Date(list[0].date),
        key,
        list: list.slice().sort((a, b) => b.date.localeCompare(a.date)),
      }));
  }, [transactions]);

  return (
    <div className="pb-24">
      {groups.length === 0 && (
        <div className="px-4 py-12 text-center text-sm text-gray-400">No transactions yet. Tap + to add one.</div>
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
