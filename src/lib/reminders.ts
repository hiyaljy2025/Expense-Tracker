import type { BillFrequency } from '../types';
import { addMonths, addWeeks, addYears } from './dateUtils';

export function advanceDueDate(dueDate: Date, frequency: BillFrequency): Date {
  switch (frequency) {
    case 'weekly':
      return addWeeks(dueDate, 1);
    case 'monthly':
      return addMonths(dueDate, 1);
    case 'yearly':
      return addYears(dueDate, 1);
    case 'once':
      return dueDate;
  }
}

export type ReminderStatus = 'overdue' | 'dueSoon' | 'upcoming';

export function getReminderStatus(daysUntilDue: number): ReminderStatus {
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 3) return 'dueSoon';
  return 'upcoming';
}
