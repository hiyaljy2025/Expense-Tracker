import type { TransactionType } from '../../types';

export function AmountText({ type, amount }: { type: TransactionType; amount: number }) {
  const isExpense = type === 'expense';
  return (
    <span className={isExpense ? 'text-expense font-semibold' : 'text-income font-semibold'}>
      {isExpense ? '-' : '+'}${amount.toFixed(2)}
    </span>
  );
}
