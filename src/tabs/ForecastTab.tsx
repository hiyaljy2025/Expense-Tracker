import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTransactions } from '../store/TransactionsContext';
import { getForecastYearTotals, groupByDay, sumByType } from '../lib/aggregate';
import { SummaryRow } from '../components/common/SummaryRow';
import { CollapsibleSection } from '../components/common/CollapsibleSection';
import { DailyGroupHeader } from '../components/transactions/DailyGroupHeader';
import { TransactionRow } from '../components/transactions/TransactionRow';
import { FloatingAddButton } from '../components/layout/FloatingAddButton';
import { ScrollSlider } from '../components/layout/ScrollSlider';
import type { Transaction } from '../types';

interface Props {
  onAdd: () => void;
  onEdit: (t: Transaction) => void;
}

export function ForecastTab({ onAdd, onEdit }: Props) {
  const { transactions, forecastEntries, budget, setYearlyBudget } = useTransactions();
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [showIncomeInfo, setShowIncomeInfo] = useState(false);
  const [showExpenseInfo, setShowExpenseInfo] = useState(false);

  function toggleDay(key: string) {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  /** Real transactions for the year (Daily tab) plus planned forecast entries (this tab), added together. */
  const totals = useMemo(
    () => getForecastYearTotals(transactions, forecastEntries, year),
    [transactions, forecastEntries, year],
  );

  const groups = useMemo(() => {
    const yearEntries = forecastEntries.filter((t) => new Date(t.date).getFullYear() === year);
    const map = groupByDay(yearEntries);
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, list]) => ({
        date: new Date(list[0].date),
        key,
        list: list.slice().sort((a, b) => b.date.localeCompare(a.date)),
      }));
  }, [forecastEntries, year]);

  const budgetPct = budget.yearly !== undefined ? Math.min((totals.expense / budget.yearly) * 100, 999) : null;
  const overBudget = budget.yearly !== undefined && totals.expense > budget.yearly;

  function handleBudgetSetting() {
    const input = window.prompt(
      'Set yearly budget amount ($):',
      budget.yearly !== undefined ? String(budget.yearly) : '',
    );
    if (input === null) return;
    const value = Number(input);
    setYearlyBudget(Number.isFinite(value) && value > 0 ? value : undefined);
  }

  return (
    <div className="pb-6">
      <div className="flex items-center justify-between bg-white px-4 py-3">
        <button onClick={() => setYear((y) => y - 1)} className="p-1 text-gray-500">
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-semibold text-gray-800">{year}</span>
        <button onClick={() => setYear((y) => y + 1)} className="p-1 text-gray-500">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="border-b border-gray-100 bg-white px-4 py-3">
        <SummaryRow
          totals={totals}
          showLabels
          incomeLabel="Forecast Income"
          expenseLabel="Forecast Expense"
          onIncomeLabelClick={() => setShowIncomeInfo((v) => !v)}
          onExpenseLabelClick={() => setShowExpenseInfo((v) => !v)}
        />
        <div className="mt-1 flex flex-col items-end gap-1">
          {totals.total < 0 && (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-expense">
              Overspend
            </span>
          )}
          {showIncomeInfo && (
            <div className="text-right text-[11px] text-gray-400">
              Forecast Income is Daily Tab Actuals + Forecast tab's Income entries
            </div>
          )}
          {showExpenseInfo && (
            <div className="text-right text-[11px] text-gray-400">
              Forecast Expense is Daily Tab Actuals + Forecast Tab's entries
            </div>
          )}
        </div>
      </div>

      <CollapsibleSection title="Yearly Budget">
        <button onClick={handleBudgetSetting} className="flex w-full items-center justify-between text-sm">
          <span className="text-gray-700">Amount</span>
          <span className="text-gray-400">
            {budget.yearly !== undefined ? `$${budget.yearly.toFixed(2)} ›` : 'Not set ›'}
          </span>
        </button>
        {budget.yearly !== undefined && budgetPct !== null && (
          <div className="mt-2">
            <div className="h-1.5 w-full rounded-full bg-gray-100">
              <div
                className={`h-1.5 rounded-full ${overBudget ? 'bg-expense' : 'bg-income'}`}
                style={{ width: `${Math.min(budgetPct, 100)}%` }}
              />
            </div>
            <div className={`mt-1 text-xs ${overBudget ? 'text-expense' : 'text-gray-400'}`}>
              ${totals.expense.toFixed(2)} of ${budget.yearly.toFixed(2)} projected used ({budgetPct.toFixed(0)}%)
              {overBudget ? ' — over budget' : ''}
            </div>
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="Forecast Income / Expense"
        className="mt-2"
        headerClassName="border-b border-gray-100 bg-white px-4 py-3"
      >
        {groups.length === 0 && (
          <div className="bg-white px-4 py-12 text-center text-sm text-gray-400">
            No forecast entries for {year} yet. Tap + to add one.
          </div>
        )}
        {groups.map((group) => {
          const collapsed = !expandedDays.has(group.key);
          return (
            <div key={group.key} className="mb-2 bg-white">
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
      </CollapsibleSection>

      <FloatingAddButton onClick={onAdd} label="Add forecast entry" sticky />
      <ScrollSlider />
    </div>
  );
}
