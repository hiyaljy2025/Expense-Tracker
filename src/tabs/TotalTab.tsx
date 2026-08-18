import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, FileSpreadsheet, Settings } from 'lucide-react';
import { useTransactions } from '../store/TransactionsContext';
import {
  getAccountBalances,
  getCategoryBreakdown,
  getMonthSummary,
  getTopTransactions,
  inRange,
  sumByType,
} from '../lib/aggregate';
import { formatMonthYear, getMonthRange } from '../lib/dateUtils';
import { SummaryRow } from '../components/common/SummaryRow';
import { CollapsibleSection } from '../components/common/CollapsibleSection';
import { exportToExcel } from '../lib/excelExport';
import { CategoryBreakdownChart } from '../components/charts/CategoryBreakdownChart';
import { ManageDataModal } from '../components/settings/ManageDataModal';
import { TopTransactionsCard } from '../components/transactions/TopTransactionsCard';
import type { Transaction } from '../types';

export function TotalTab({ onEditTransaction }: { onEditTransaction: (t: Transaction) => void }) {
  const { transactions, accounts, accountOpeningBalances, budget, setBudget } = useTransactions();
  const [cursor, setCursor] = useState(() => new Date());
  const [manageOpen, setManageOpen] = useState(false);
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const monthSummary = useMemo(() => getMonthSummary(transactions, year, month), [transactions, year, month]);

  const monthTx = useMemo(() => {
    const { start, end } = getMonthRange(year, month);
    return inRange(transactions, start, end);
  }, [transactions, year, month]);

  const monthExpenseTx = useMemo(() => monthTx.filter((t) => t.type === 'expense'), [monthTx]);
  const monthIncomeTx = useMemo(() => monthTx.filter((t) => t.type === 'income'), [monthTx]);

  const categoryBreakdown = useMemo(() => getCategoryBreakdown(monthExpenseTx), [monthExpenseTx]);
  const topExpenses = useMemo(() => getTopTransactions(monthExpenseTx, 10), [monthExpenseTx]);
  const topIncome = useMemo(() => getTopTransactions(monthIncomeTx, 10), [monthIncomeTx]);

  const lastMonthExpense = useMemo(() => {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const { start, end } = getMonthRange(prevYear, prevMonth);
    return sumByType(inRange(transactions, start, end)).expense;
  }, [transactions, year, month]);

  /** Remaining headroom before this month's expense catches up to last month's, as an amount and a % of last month's expense. */
  const remainingVsLastMonth = useMemo(() => {
    if (lastMonthExpense === 0) return null;
    const remaining = lastMonthExpense - monthSummary.expense;
    return { remaining, pct: (remaining / lastMonthExpense) * 100 };
  }, [monthSummary, lastMonthExpense]);

  const balances = useMemo(
    () => getAccountBalances(transactions, accounts, accountOpeningBalances),
    [transactions, accounts, accountOpeningBalances],
  );

  const budgetPct = budget.monthly !== undefined ? Math.min((monthSummary.expense / budget.monthly) * 100, 999) : null;
  const overBudget = budget.monthly !== undefined && monthSummary.expense > budget.monthly;

  function handleBudgetSetting() {
    const input = window.prompt(
      'Set monthly budget amount ($):',
      budget.monthly !== undefined ? String(budget.monthly) : '',
    );
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
        <div className="flex items-center gap-2">
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="p-1 text-gray-500">
            <ChevronRight size={20} />
          </button>
          <button onClick={() => setManageOpen(true)} className="p-1 text-gray-400" aria-label="Manage data">
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className="border-b border-gray-100 bg-white px-4 py-3">
        <SummaryRow totals={monthSummary} showLabels />
      </div>

      <CollapsibleSection title="Accounts">
        <div className="mb-2 text-[11px] text-gray-400">
          Opening Balance + Net Actual (Actual Income − Actual Expense). No forecast entries involved.
        </div>
        <div className="rounded-lg border border-gray-100 p-3 text-sm">
          {accounts.map((a) => {
            const balance = balances.get(a) ?? 0;
            return (
              <div key={a} className="flex justify-between py-1">
                <span className="text-gray-500">{a} balance</span>
                <span className="font-medium text-gray-700">
                  {balance < 0 ? '-$' : '$'}
                  {Math.abs(balance).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Monthly Budget">
        <button onClick={handleBudgetSetting} className="flex w-full items-center justify-between text-sm">
          <span className="text-gray-700">Amount</span>
          <span className="text-gray-400">
            {budget.monthly !== undefined ? `$${budget.monthly.toFixed(2)} ›` : 'Not set ›'}
          </span>
        </button>
        {budget.monthly !== undefined && budgetPct !== null && (
          <div className="mt-2">
            <div className="h-1.5 w-full rounded-full bg-gray-100">
              <div
                className={`h-1.5 rounded-full ${overBudget ? 'bg-expense' : 'bg-income'}`}
                style={{ width: `${Math.min(budgetPct, 100)}%` }}
              />
            </div>
            <div className={`mt-1 text-xs ${overBudget ? 'text-expense' : 'text-gray-400'}`}>
              ${monthSummary.expense.toFixed(2)} of ${budget.monthly.toFixed(2)} used ({budgetPct.toFixed(0)}%)
              {overBudget ? ' — over budget' : ''}
            </div>
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="Compared Expenses">
        <div className="rounded-lg border border-gray-100 p-3 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Last Month Expense</span>
            <span className="font-medium text-gray-700">${lastMonthExpense.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">This Month Expense</span>
            <span className="flex items-center gap-1.5">
              {remainingVsLastMonth !== null && remainingVsLastMonth.remaining < 0 && (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-expense">
                  Overspent
                </span>
              )}
              <span className="font-medium text-expense">${monthSummary.expense.toFixed(2)}</span>
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Hitting Last Month Expense</span>
            <span
              className={`font-medium ${
                remainingVsLastMonth === null
                  ? 'text-gray-700'
                  : remainingVsLastMonth.remaining < 0
                    ? 'text-expense'
                    : 'text-income'
              }`}
            >
              {remainingVsLastMonth === null
                ? '—'
                : `${remainingVsLastMonth.remaining < 0 ? '-$' : '$'}${Math.abs(remainingVsLastMonth.remaining).toFixed(2)} (${remainingVsLastMonth.pct.toFixed(0)}%)`}
            </span>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Spending by Category">
        <CategoryBreakdownChart data={categoryBreakdown} />
      </CollapsibleSection>

      <TopTransactionsCard title="Top 10 Expenses" transactions={topExpenses} onSelect={onEditTransaction} />
      <TopTransactionsCard title="Top 10 Income" transactions={topIncome} onSelect={onEditTransaction} />

      <div className="mt-2 flex flex-col gap-2 bg-white px-4 py-3">
        <button
          onClick={() => exportToExcel(transactions)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <FileSpreadsheet size={18} className="text-green-600" />
          Export data to Excel
        </button>
        <button
          onClick={() => setManageOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Settings size={16} />
          Manage Categories, Accounts &amp; Backup
        </button>
      </div>

      {manageOpen && <ManageDataModal onClose={() => setManageOpen(false)} />}
    </div>
  );
}
