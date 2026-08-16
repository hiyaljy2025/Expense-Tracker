import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { useTransactions } from '../store/TransactionsContext';
import { getMonthSummary, inRange, sumByAccount, sumByType } from '../lib/aggregate';
import { formatMonthYear, getMonthRange } from '../lib/dateUtils';
import { SummaryRow } from '../components/common/SummaryRow';
import { exportToExcel } from '../lib/excelExport';

export function TotalTab() {
  const { transactions, budget, setBudget } = useTransactions();
  const [cursor, setCursor] = useState(() => new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const monthSummary = useMemo(() => getMonthSummary(transactions, year, month), [transactions, year, month]);

  const compareLastMonth = useMemo(() => {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prev = sumByType(inRange(transactions, getMonthRange(prevYear, prevMonth).start, getMonthRange(prevYear, prevMonth).end));
    if (prev.expense === 0) return null;
    return ((monthSummary.expense - prev.expense) / prev.expense) * 100;
  }, [transactions, year, month, monthSummary]);

  const accountBreakdown = useMemo(() => {
    const { start, end } = getMonthRange(year, month);
    return sumByAccount(inRange(transactions, start, end));
  }, [transactions, year, month]);

  function handleBudgetSetting() {
    const input = window.prompt('Set monthly budget amount ($):', budget.monthly ? String(budget.monthly) : '');
    if (input === null) return;
    const value = Number(input);
    setBudget(Number.isFinite(value) && value > 0 ? value : undefined);
  }

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

      <div className="border-b border-gray-100 bg-white px-4 py-3">
        <SummaryRow totals={monthSummary} />
      </div>

      <div className="mt-2 bg-white px-4 py-3">
        <button onClick={handleBudgetSetting} className="flex w-full items-center justify-between text-sm">
          <span className="text-gray-700">Budget Setting</span>
          <span className="text-gray-400">
            {budget.monthly ? `$${budget.monthly.toFixed(2)} ›` : 'Not set ›'}
          </span>
        </button>
      </div>

      <div className="mt-2 bg-white px-4 py-3">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Accounts</h3>
        <div className="rounded-lg border border-gray-100 p-3 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Compared Expenses (Last month)</span>
            <span className="font-medium text-gray-700">
              {compareLastMonth === null ? '—' : `${compareLastMonth > 0 ? '+' : ''}${compareLastMonth.toFixed(0)}%`}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Expenses (Cash)</span>
            <span className="font-medium text-gray-700">${(accountBreakdown.get('Cash') ?? 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Expenses (Card)</span>
            <span className="font-medium text-gray-700">${(accountBreakdown.get('Card') ?? 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-2 bg-white px-4 py-3">
        <button
          onClick={() => exportToExcel(transactions)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <FileSpreadsheet size={18} className="text-green-600" />
          Export data to Excel
        </button>
      </div>
    </div>
  );
}
