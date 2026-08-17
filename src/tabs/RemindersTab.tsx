import { useMemo } from 'react';
import { useTransactions } from '../store/TransactionsContext';
import { daysUntil, parseDateInputValue } from '../lib/dateUtils';
import { getReminderStatus, type ReminderStatus } from '../lib/reminders';
import { ReminderRow } from '../components/reminders/ReminderRow';
import { FloatingAddButton } from '../components/layout/FloatingAddButton';
import { CollapsibleSection } from '../components/common/CollapsibleSection';
import type { BillReminder } from '../types';

const SECTIONS: { status: ReminderStatus; title: string }[] = [
  { status: 'overdue', title: 'Overdue' },
  { status: 'dueSoon', title: 'Due Soon' },
  { status: 'upcoming', title: 'Upcoming' },
];

interface Props {
  onAdd: () => void;
  onEdit: (reminder: BillReminder) => void;
}

export function RemindersTab({ onAdd, onEdit }: Props) {
  const { reminders, markReminderPaid } = useTransactions();

  const grouped = useMemo(() => {
    const map: Record<ReminderStatus, BillReminder[]> = { overdue: [], dueSoon: [], upcoming: [] };
    for (const r of reminders) {
      map[getReminderStatus(daysUntil(parseDateInputValue(r.dueDate)))].push(r);
    }
    for (const key of Object.keys(map) as ReminderStatus[]) {
      map[key].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    }
    return map;
  }, [reminders]);

  function handleMarkPaid(reminder: BillReminder) {
    const willRecur = reminder.frequency !== 'once';
    const confirmMsg = willRecur
      ? `Mark "${reminder.name}" ($${reminder.amount.toFixed(2)}) as paid today? This logs an expense and moves the reminder to its next ${reminder.frequency} due date.`
      : `Mark "${reminder.name}" ($${reminder.amount.toFixed(2)}) as paid today? This logs an expense and removes this one-time reminder.`;
    if (window.confirm(confirmMsg)) {
      markReminderPaid(reminder.id);
    }
  }

  return (
    <div className="pb-24">
      {reminders.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-gray-400">
          No bill reminders yet. Tap + to add one.
        </div>
      ) : (
        SECTIONS.map(
          ({ status, title }) =>
            grouped[status].length > 0 && (
              <CollapsibleSection
                key={status}
                title={`${title} (${grouped[status].length})`}
                className="mb-2 bg-white"
                headerClassName="border-b border-gray-100 px-4 py-2"
                titleClassName="text-xs font-semibold uppercase tracking-wide text-gray-400"
              >
                {grouped[status].map((r) => (
                  <ReminderRow
                    key={r.id}
                    reminder={r}
                    onEdit={() => onEdit(r)}
                    onMarkPaid={() => handleMarkPaid(r)}
                  />
                ))}
              </CollapsibleSection>
            ),
        )
      )}
      <FloatingAddButton onClick={onAdd} label="Add reminder" />
    </div>
  );
}
