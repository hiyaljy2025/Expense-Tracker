import type { Totals } from '../../lib/aggregate';

export function SummaryRow({
  totals,
  showTotal = true,
  showLabels = false,
  incomeLabel = 'Income',
  expenseLabel = 'Expense',
  onIncomeLabelClick,
  onExpenseLabelClick,
}: {
  totals: Totals;
  showTotal?: boolean;
  showLabels?: boolean;
  incomeLabel?: string;
  expenseLabel?: string;
  onIncomeLabelClick?: () => void;
  onExpenseLabelClick?: () => void;
}) {
  return (
    <div className={`grid ${showTotal ? 'grid-cols-3' : 'grid-cols-2'} gap-2 text-right text-sm`}>
      <div>
        {showLabels &&
          (onIncomeLabelClick ? (
            <button
              type="button"
              onClick={onIncomeLabelClick}
              className="block w-full text-right text-[11px] text-gray-400 underline decoration-dotted underline-offset-2"
            >
              {incomeLabel}
            </button>
          ) : (
            <div className="text-[11px] text-gray-400">{incomeLabel}</div>
          ))}
        <span className="text-income font-medium">${totals.income.toFixed(2)}</span>
      </div>
      <div>
        {showLabels &&
          (onExpenseLabelClick ? (
            <button
              type="button"
              onClick={onExpenseLabelClick}
              className="block w-full text-right text-[11px] text-gray-400 underline decoration-dotted underline-offset-2"
            >
              {expenseLabel}
            </button>
          ) : (
            <div className="text-[11px] text-gray-400">{expenseLabel}</div>
          ))}
        <span className="text-expense font-medium">${totals.expense.toFixed(2)}</span>
      </div>
      {showTotal && (
        <div>
          {showLabels && <div className="text-[11px] text-gray-400">Net</div>}
          <span className="font-medium text-gray-700">
            {totals.total < 0 ? '-' : ''}${Math.abs(totals.total).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}
