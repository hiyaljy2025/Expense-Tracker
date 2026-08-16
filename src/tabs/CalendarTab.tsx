import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTransactions } from '../store/TransactionsContext';
import { dayKey, formatMonthYear, getMonthGridDays, isSameMonth, isToday } from '../lib/dateUtils';
import { groupByDay, sumByType } from '../lib/aggregate';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarTab({ onSelectDay }: { onSelectDay: (dayKey: string) => void }) {
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
          const key = dayKey(d);
          const dayTx = byDay.get(key) ?? [];
          const totals = sumByType(dayTx);
          const hasData = dayTx.length > 0;
          return (
            <button
              key={key}
              onClick={() => onSelectDay(key)}
              className={`min-h-16 border-b border-r border-gray-50 p-1 text-center hover:bg-gray-50 ${
                inMonth ? '' : 'opacity-30'
              }`}
            >
              <div
                className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                  isToday(d) ? 'bg-red-500 font-semibold text-white' : 'text-gray-600'
                }`}
              >
                {d.getDate()}
              </div>
              {hasData ? (
                <>
                  <div className="text-[10px] text-income">+{totals.income.toFixed(0)}</div>
                  <div className="text-[10px] text-expense">-{totals.expense.toFixed(0)}</div>
                </>
              ) : (
                <div className="text-[10px] text-transparent select-none">&nbsp;</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
