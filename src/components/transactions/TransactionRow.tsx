import type { Transaction } from '../../types';
import { AmountText } from './AmountText';

export function TransactionRow({ transaction, onClick }: { transaction: Transaction; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
    >
      <div>
        <div className="text-sm font-medium text-gray-800">{transaction.category}</div>
        <div className="text-xs text-gray-400">{transaction.account}</div>
      </div>
      <AmountText type={transaction.type} amount={transaction.amount} />
    </button>
  );
}
