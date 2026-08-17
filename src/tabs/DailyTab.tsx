import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTransactions } from '../store/TransactionsContext';
import { groupByDay, sumByType } from '../lib/aggregate';
import { dayKey, getMonthRange, isToday, parseDateInputValue } from '../lib/dateUtils';
import { DailyGroupHeader } from '../components/transactions/DailyGroupHeader';
import { TransactionRow } from '../components/transactions/TransactionRow';
import { FloatingAddButton } from '../components/layout/FloatingAddButton';
import { ScrollSlider } from '../components/layout/ScrollSlider';
import type { Transaction } from '../types';

interface Props {
  onAdd: () => void;
  onEdit: (t: Transaction) => void;
  focusDay?: string | null;
  onClearFocus?: () => void;
}

export function DailyTab({ onAdd, onEdit, focusDay, onClearFocus }: Props) {
  const { transactions } = useTransactions();
  const [cursor, setCursor] = useState(() => (focusDay ? parseDateInputValue(focusDay) : new Date()));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const [rangeMonths, setRangeMonths] = useState<1 | 3>(1);
  /** Collapsed by default; pre-expand `focusDay` since the user navigated here specifically to see it. */
  const [expandedDays, setExpandedDays] = useState<Set<string>>(() => (focusDay ? new Set([focusDay]) : new Set()));

  function toggleDay(key: string) {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectMonth(y: number, m: number) {
    setCursor(new Date(y, m, 1));
    onClearFocus?.();
  }

  function selectRange(months: 1 | 3) {
    setRangeMonths(months);
    onClearFocus?.();
  }

  const groups = useMemo(() => {
    const map = groupByDay(transactions);
    const rangeStartKey = dayKey(getMonthRange(year, month - (rangeMonths - 1)).start);
    const rangeEndKey = dayKey(getMonthRange(year, month).end);
    return Array.from(map.entries())
      .filter(([key]) => {
        if (focusDay) return key === focusDay;
        return key >= rangeStartKey && key <= rangeEndKey;
      })
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, list]) => ({
        date: new Date(list[0].date),
        key,
        list: list.slice().sort((a, b) => b.date.localeCompare(a.date)),
      }));
  }, [transactions, focusDay, year, month, rangeMonths]);

  return (
    <div className="pb-6">
      <div className="flex items-center justify-between bg-white px-4 py-3">
        <button onClick={() => selectMonth(year - 1, month)} className="p-1 text-gray-500">
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-semibold text-gray-800">{year}</span>
        <button onClick={() => selectMonth(year + 1, month)} className="p-1 text-gray-500">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex justify-center gap-2 border-b border-gray-100 bg-white px-4 py-2">
        <button
          onClick={() => selectRange(1)}
          className={`rounded-lg px-3 py-1 text-xs font-medium ${
            rangeMonths === 1 ? 'bg-expense text-white' : 'border border-gray-200 text-gray-500'
          }`}
        >
          1 Month
        </button>
        <button
          onClick={() => selectRange(3)}
          className={`rounded-lg px-3 py-1 text-xs font-medium ${
            rangeMonths === 3 ? 'bg-expense text-white' : 'border border-gray-200 text-gray-500'
          }`}
        >
          3 Months
        </button>
      </div>

      <div className="grid grid-cols-6 gap-1 border-b border-gray-100 bg-white px-3 py-2">
        {Array.from({ length: 12 }, (_, m) => m).map((m) => (
          <button
            key={m}
            onClick={() => selectMonth(year, m)}
            className={`rounded-lg py-1.5 text-sm font-medium ${
              m === month ? 'bg-expense text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {m + 1}
          </button>
        ))}
      </div>

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
          {focusDay
            ? 'No transactions on this day.'
            : `No transactions in the last ${rangeMonths === 1 ? 'month' : `${rangeMonths} months`}. Tap + to add one.`}
        </div>
      )}
      {groups.map((group) => {
        const collapsed = !expandedDays.has(group.key);
        return (
          <div
            key={group.key}
            className={`mb-2 bg-white ${isToday(group.date) ? 'border-2 border-expense' : ''}`}
          >
            <DailyGroupHeader
              date={group.date}
              totals={sumByType(group.list)}
              collapsed={collapsed}
              onToggle={() => toggleDay(group.key)}
            />
            {!collapsed && (
              <div className="divide-y divide-gray-100">
                {group.list.map((t) => (
                  <TransactionRow key={t.id} transaction={t} onClick={() => onEdit(t)} />
                ))}
              </div>
            )}
          </div>
        );
      })}
      <FloatingAddButton onClick={onAdd} sticky />
      <ScrollSlider />
    </div>
  );
}
