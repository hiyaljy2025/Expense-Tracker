import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatFullDate } from '../../lib/dateUtils';
import type { Totals } from '../../lib/aggregate';

export function DailyGroupHeader({
  date,
  totals,
  collapsed,
  onToggle,
}: {
  date: Date;
  totals: Totals;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between bg-gray-100 px-4 py-2 text-sm"
    >
      <span className="flex items-center gap-1 font-medium text-gray-600">
        {formatFullDate(date)}
        {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </span>
      <div className="flex gap-4">
        <span className="text-lg font-semibold text-income">${totals.income.toFixed(2)}</span>
        <span className="text-lg font-semibold text-expense">${totals.expense.toFixed(2)}</span>
      </div>
    </button>
  );
}
