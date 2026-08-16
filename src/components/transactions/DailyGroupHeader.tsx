import { formatDayHeader } from '../../lib/dateUtils';
import type { Totals } from '../../lib/aggregate';

export function DailyGroupHeader({ date, totals }: { date: Date; totals: Totals }) {
  return (
    <div className="flex items-center justify-between bg-gray-100 px-4 py-2 text-sm">
      <span className="font-medium text-gray-600">{formatDayHeader(date)}</span>
      <div className="flex gap-4">
        <span className="text-income font-medium">${totals.income.toFixed(2)}</span>
        <span className="text-expense font-medium">${totals.expense.toFixed(2)}</span>
      </div>
    </div>
  );
}
