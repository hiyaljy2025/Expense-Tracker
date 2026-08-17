const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** yyyy-mm-dd key derived from local date parts (avoids UTC/timezone shift bugs). */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Sunday-to-Saturday week range containing `date`. */
export function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = startOfDay(date);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

export function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  return {
    start: new Date(year, month, 1),
    end: new Date(year, month + 1, 0),
  };
}

/**
 * Sun-Sat week ranges belonging to the given month, in chronological order. Each week is assigned
 * to whichever month contains the majority of its 7 days, so a week straddling a month boundary
 * (e.g. May 31 - Jun 6, only 1 day in May) is listed only under June, never duplicated into May too.
 */
export function getWeeksInMonth(year: number, month: number): { start: Date; end: Date }[] {
  const { start, end } = getMonthRange(year, month);
  const weeks: { start: Date; end: Date }[] = [];
  let cursor = getWeekRange(start).start;
  while (cursor <= end) {
    const week = getWeekRange(cursor);
    let daysInMonth = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(week.start);
      d.setDate(d.getDate() + i);
      if (d.getFullYear() === year && d.getMonth() === month) daysInMonth++;
    }
    if (daysInMonth >= 4) weeks.push(week);
    cursor = new Date(week.start);
    cursor.setDate(cursor.getDate() + 7);
  }
  return weeks;
}

/** 42 cells (6 rows x 7 cols) covering the month, including leading/trailing days. */
export function getMonthGridDays(year: number, month: number): Date[] {
  const { start } = getMonthRange(year, month);
  const gridStart = new Date(start);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

export function isSameMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month;
}

export function formatMonthYear(year: number, month: number): string {
  return `${MONTH_SHORT[month]} ${year}`;
}

export function formatShortRange(start: Date, end: Date): string {
  const fmt = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  return `${fmt(start)} ~ ${fmt(end)}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** e.g. "11:37 AM". */
export function formatTime12(date: Date): string {
  const hours24 = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${minutes} ${period}`;
}

export function todayStamp(): string {
  return formatDate(new Date().toISOString());
}

/** Format a Date for an <input type="datetime-local"> value, in local time. */
export function toDatetimeLocalValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}`;
}

export function addWeeks(date: Date, count: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + count * 7);
  return d;
}

/** Adds calendar months, clamping the day so e.g. Jan 31 + 1 month lands on Feb 28/29 instead of rolling into March. */
export function addMonths(date: Date, count: number): Date {
  const d = new Date(date);
  const targetMonth = d.getMonth() + count;
  const daysInTargetMonth = new Date(d.getFullYear(), targetMonth + 1, 0).getDate();
  d.setDate(Math.min(d.getDate(), daysInTargetMonth));
  d.setMonth(targetMonth);
  return d;
}

export function isToday(date: Date): boolean {
  const now = new Date();
  return dayKey(date) === dayKey(now);
}

export function addYears(date: Date, count: number): Date {
  return addMonths(date, count * 12);
}

/** Whole calendar days from today to `date` (negative if `date` is in the past). */
export function daysUntil(date: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(date).getTime() - startOfDay(new Date()).getTime()) / msPerDay);
}

/** Format a Date for an <input type="date"> value, in local time. */
export function toDateInputValue(date: Date): string {
  return dayKey(date);
}

/** Parses a yyyy-mm-dd string (e.g. from toDateInputValue) into a local-time Date. */
export function parseDateInputValue(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** e.g. "17 AUG 2026". */
export function formatFullDate(date: Date): string {
  return `${date.getDate()} ${MONTH_SHORT[date.getMonth()].toUpperCase()} ${date.getFullYear()}`;
}
