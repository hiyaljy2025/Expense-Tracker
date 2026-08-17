import { Check } from 'lucide-react';
import type { BillReminder } from '../../types';
import { daysUntil, formatFullDate, parseDateInputValue } from '../../lib/dateUtils';
import { getReminderStatus } from '../../lib/reminders';

const STATUS_STYLES = {
  overdue: 'bg-red-50 text-expense',
  dueSoon: 'bg-amber-50 text-amber-600',
  upcoming: 'bg-gray-100 text-gray-500',
};

function statusLabel(daysLeft: number): string {
  if (daysLeft < 0) return `Overdue by ${Math.abs(daysLeft)}d`;
  if (daysLeft === 0) return 'Due today';
  if (daysLeft === 1) return 'Due tomorrow';
  return `Due in ${daysLeft}d`;
}

export function ReminderRow({
  reminder,
  onEdit,
  onMarkPaid,
}: {
  reminder: BillReminder;
  onEdit: () => void;
  onMarkPaid: () => void;
}) {
  const daysLeft = daysUntil(parseDateInputValue(reminder.dueDate));
  const status = getReminderStatus(daysLeft);

  return (
    <div className="border-b border-gray-100 px-4 py-3 last:border-b-0">
      <button onClick={onEdit} className="flex w-full items-start justify-between text-left">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-gray-800">{reminder.name}</div>
          <div className="text-xs text-gray-400">
            {reminder.category} · {reminder.account} · {reminder.frequency}
          </div>
        </div>
        <div className="ml-2 shrink-0 text-right">
          <div className="text-sm font-semibold text-expense">${reminder.amount.toFixed(2)}</div>
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[status]}`}>
            {statusLabel(daysLeft)}
          </span>
        </div>
      </button>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <span>Due {formatFullDate(parseDateInputValue(reminder.dueDate))}</span>
        <button
          onClick={onMarkPaid}
          className="flex items-center gap-1 rounded-full bg-income px-3 py-1 text-xs font-medium text-white hover:bg-teal-700"
        >
          <Check size={12} /> Mark Paid
        </button>
      </div>
    </div>
  );
}
