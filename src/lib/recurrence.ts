import type { RecurrenceFrequency, Transaction } from '../types';
import { addMonths, addWeeks } from './dateUtils';
import { createId } from './id';

/** Generates `occurrences` transactions starting at `base.date`, spaced by `frequency`, sharing one seriesId. */
export function generateSeries(
  base: Omit<Transaction, 'id' | 'seriesId'>,
  frequency: RecurrenceFrequency,
  occurrences: number,
): Transaction[] {
  const seriesId = createId();
  const startDate = new Date(base.date);
  const step = frequency === 'weekly' ? addWeeks : addMonths;
  return Array.from({ length: Math.max(1, occurrences) }, (_, i) => ({
    ...base,
    id: createId(),
    seriesId,
    date: (i === 0 ? startDate : step(startDate, i)).toISOString(),
  }));
}
