import { useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { useTransactions } from '../store/TransactionsContext';
import { getYearSummary, type MonthSummary } from '../lib/aggregate';
import { formatShortRange } from '../lib/dateUtils';
import { SummaryRow } from '../components/common/SummaryRow';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function WeeklyMonthlyTab() {
  const { transactions } = useTransactions();
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [openMonth, setOpenMonth] = useState<string | null>(null);

  const summary = useMemo(() => getYearSummary(transactions, year), [transactions, year]);

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between bg-white px-4 py-3">
        <button onClick={() => setYear((y) => y - 1)} className="p-1 text-gray-500">
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-semibold text-gray-800">{year}</span>
        <button onClick={() => setYear((y) => y + 1)} className="p-1 text-gray-500">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="border-b border-gray-100 bg-white px-4 py-2">
        <SummaryRow totals={summary.totals} />
      </div>

      {summary.months.length === 0 && (
        <div className="px-4 py-12 text-center text-sm text-gray-400">No transactions in {year}.</div>
      )}

      {summary.months.map((m: MonthSummary) => {
        const key = `${m.year}-${m.month}`;
        const isOpen = openMonth === key;
        return (
          <div key={key} className="mb-2 bg-white">
            <button
              onClick={() => setOpenMonth(isOpen ? null : key)}
              className="flex w-full items-center justify-between px-4 py-3"
            >
              <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                {MONTH_NAMES[m.month]}
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
              <div className="w-2/3">
                <SummaryRow totals={m} />
              </div>
            </button>
            {isOpen && (
              <div className="divide-y divide-gray-50 border-t border-gray-50">
                {m.weeks
                  .slice()
                  .reverse()
                  .map((w) => (
                    <div key={w.start.toISOString()} className="flex items-center justify-between px-4 py-2">
                      <span className="text-xs text-gray-500">{formatShortRange(w.start, w.end)}</span>
                      <div className="w-2/3">
                        <SummaryRow totals={w} />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
