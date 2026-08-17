import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTransactions } from '../store/TransactionsContext';
import { dayKey, getMonthGridDays, getMonthRange, isSameMonth, isToday } from '../lib/dateUtils';
import { getMonthSummary, groupByDay, inRange, sumByType, sumExpenseByAccount, sumIncomeByAccount } from '../lib/aggregate';
import { SummaryRow } from '../components/common/SummaryRow';
import { CollapsibleSection } from '../components/common/CollapsibleSection';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarTab({ onSelectDay }: { onSelectDay: (dayKey: string) => void }) {
  const { transactions, accounts } = useTransactions();
  const [cursor, setCursor] = useState(() => new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const byDay = useMemo(() => groupByDay(transactions), [transactions]);
  const gridDays = useMemo(() => getMonthGridDays(year, month), [year, month]);
  const monthSummary = useMemo(() => getMonthSummary(transactions, year, month), [transactions, year, month]);

  const accountExpense = useMemo(() => {
    const { start, end } = getMonthRange(year, month);
    return sumExpenseByAccount(inRange(transactions, start, end));
  }, [transactions, year, month]);

  /** Cumulative expense by account from Jan 1 through the end of the currently viewed month. */
  const ytdAccountExpense = useMemo(() => {
    const { end } = getMonthRange(year, month);
    return sumExpenseByAccount(inRange(transactions, new Date(year, 0, 1), end));
  }, [transactions, year, month]);

  const accountIncome = useMemo(() => {
    const { start, end } = getMonthRange(year, month);
    return sumIncomeByAccount(inRange(transactions, start, end));
  }, [transactions, year, month]);

  /** Cumulative income by account from Jan 1 through the end of the currently viewed month. */
  const ytdAccountIncome = useMemo(() => {
    const { end } = getMonthRange(year, month);
    return sumIncomeByAccount(inRange(transactions, new Date(year, 0, 1), end));
  }, [transactions, year, month]);

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between bg-white px-4 py-3">
        <button onClick={() => setCursor(new Date(year - 1, month, 1))} className="p-1 text-gray-500">
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-semibold text-gray-800">{year}</span>
        <button onClick={() => setCursor(new Date(year + 1, month, 1))} className="p-1 text-gray-500">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-6 gap-1 border-b border-gray-100 bg-white px-3 py-2">
        {Array.from({ length: 12 }, (_, m) => m).map((m) => (
          <button
            key={m}
            onClick={() => setCursor(new Date(year, m, 1))}
            className={`rounded-lg py-1.5 text-sm font-medium ${
              m === month ? 'bg-expense text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {m + 1}
          </button>
        ))}
      </div>

      <div className="border-b border-gray-100 bg-white px-4 py-3">
        <SummaryRow totals={monthSummary} showLabels />
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
                  <div className="text-[10px] text-income">+{totals.income.toFixed(2)}</div>
                  <div className="text-[10px] text-expense">-{totals.expense.toFixed(2)}</div>
                </>
              ) : (
                <div className="text-[10px] text-transparent select-none">&nbsp;</div>
              )}
            </button>
          );
        })}
      </div>

      <CollapsibleSection title="Income by Account">
        <div className="rounded-lg border border-gray-100 p-3 text-sm">
          <div className="flex justify-end gap-4 pb-1 text-[10px] text-gray-400">
            <span className="w-20 text-right">Year to Date</span>
            <span className="w-20 text-right">This Month</span>
          </div>
          {accounts.map((a) => (
            <div key={a} className="flex items-center justify-between py-1">
              <span className="text-gray-500">{a}</span>
              <div className="flex gap-4">
                <span className="w-20 text-right font-medium text-income">
                  ${(ytdAccountIncome.get(a) ?? 0).toFixed(2)}
                </span>
                <span className="w-20 text-right font-medium text-income">
                  ${(accountIncome.get(a) ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Expense by Account">
        <div className="rounded-lg border border-gray-100 p-3 text-sm">
          <div className="flex justify-end gap-4 pb-1 text-[10px] text-gray-400">
            <span className="w-20 text-right">Year to Date</span>
            <span className="w-20 text-right">This Month</span>
          </div>
          {accounts.map((a) => (
            <div key={a} className="flex items-center justify-between py-1">
              <span className="text-gray-500">{a}</span>
              <div className="flex gap-4">
                <span className="w-20 text-right font-medium text-expense">
                  ${(ytdAccountExpense.get(a) ?? 0).toFixed(2)}
                </span>
                <span className="w-20 text-right font-medium text-expense">
                  ${(accountExpense.get(a) ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}
