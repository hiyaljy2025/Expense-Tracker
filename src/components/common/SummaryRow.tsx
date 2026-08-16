import type { Totals } from '../../lib/aggregate';

export function SummaryRow({ totals, showTotal = true }: { totals: Totals; showTotal?: boolean }) {
  return (
    <div className={`grid ${showTotal ? 'grid-cols-3' : 'grid-cols-2'} gap-2 text-right text-sm`}>
      <div>
        <span className="text-income font-medium">${totals.income.toFixed(2)}</span>
      </div>
      <div>
        <span className="text-expense font-medium">${totals.expense.toFixed(2)}</span>
      </div>
      {showTotal && (
        <div>
          <span className="font-medium text-gray-700">
            {totals.total < 0 ? '-' : ''}${Math.abs(totals.total).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}
