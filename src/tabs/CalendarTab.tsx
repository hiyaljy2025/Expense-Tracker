import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTransactions } from '../store/TransactionsContext';
import { dayKey, formatMonthYear, getMonthGridDays, isSameMonth } from '../lib/dateUtils';
import { groupByDay, sumByType } from '../lib/aggregate';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarTab() {
  const { transactions } = useTransactions();
  const [cursor, setCursor] = useState(() => new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const byDay = useMemo(() => groupByDay(transactions), [transactions]);
  const gridDays = useMemo(() => getMonthGridDays(year, month), [year, month]);

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between bg-white px-4 py-3">
        <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="p-1 text-gray-500">
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-semibold text-gray-800">{formatMonthYear(year, month)}</span>
        <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="p-1 text-gray-500">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-100 bg-white text-center text-xs text-gray-400">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="py-2">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 bg-white">
        {gridDays.map((d) => {
          const inMonth = isSameMonth(d, year, month);
          const dayTx = byDay.get(dayKey(d)) ?? [];
          const totals = sumByType(dayTx);
          return (
            <div
              key={d.toISOString()}
              className={`min-h-16 border-b border-r border-gray-50 p-1 text-center ${inMonth ? '' : 'opacity-30'}`}
            >
              <div className="text-xs text-gray-600">{d.getDate()}</div>
              {totals.income > 0 && <div className="text-[10px] text-income">+{totals.income.toFixed(0)}</div>}
              {totals.expense > 0 && <div className="text-[10px] text-expense">-{totals.expense.toFixed(0)}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
