import type { Transaction } from '../../types';
import { AmountText } from './AmountText';

export function TransactionRow({ transaction, onClick }: { transaction: Transaction; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-gray-800">{transaction.category}</div>
        <div className="truncate text-xs text-gray-400">
          {transaction.account}
          {transaction.note ? ` · ${transaction.note}` : ''}
        </div>
      </div>
      <AmountText type={transaction.type} amount={transaction.amount} />
    </button>
  );
}
