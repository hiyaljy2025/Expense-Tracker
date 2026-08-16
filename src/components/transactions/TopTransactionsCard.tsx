import type { Transaction } from '../../types';
import { formatDayHeader } from '../../lib/dateUtils';
import { AmountText } from './AmountText';

export function TopTransactionsCard({
  title,
  transactions,
  onSelect,
}: {
  title: string;
  transactions: Transaction[];
  onSelect: (t: Transaction) => void;
}) {
  return (
    <div className="mt-2 bg-white px-4 py-3">
      <h3 className="mb-2 text-sm font-semibold text-gray-700">{title}</h3>
      {transactions.length === 0 ? (
        <div className="py-4 text-center text-sm text-gray-400">Nothing this month.</div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
          {transactions.map((t, i) => (
            <button
              key={t.id}
              onClick={() => onSelect(t)}
              className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-50"
            >
              <span className="w-4 shrink-0 text-xs font-medium text-gray-300">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-gray-800">{t.category}</div>
                <div className="truncate text-xs text-gray-400">
                  {formatDayHeader(new Date(t.date))} · {t.account}
                  {t.note ? ` · ${t.note}` : ''}
                </div>
              </div>
              <AmountText type={t.type} amount={t.amount} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
