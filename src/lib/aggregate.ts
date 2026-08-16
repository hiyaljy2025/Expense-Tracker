import type { Transaction } from '../types';
import { dayKey, getMonthRange, getWeeksInMonth } from './dateUtils';

export interface Totals {
  income: number;
  expense: number;
  total: number;
}

export function sumByType(transactions: Transaction[]): Totals {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, total: income - expense };
}

export function groupByDay(transactions: Transaction[]): Map<string, Transaction[]> {
  const map = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const key = dayKey(new Date(t.date));
    const list = map.get(key);
    if (list) list.push(t);
    else map.set(key, [t]);
  }
  return map;
}

export function inRange(transactions: Transaction[], start: Date, end: Date): Transaction[] {
  const startMs = start.getTime();
  const endMs = end.getTime() + 24 * 60 * 60 * 1000 - 1; // inclusive through end of `end` day
  return transactions.filter((t) => {
    const ms = new Date(t.date).getTime();
    return ms >= startMs && ms <= endMs;
  });
}

export interface WeekSummary extends Totals {
  start: Date;
  end: Date;
}

export interface MonthSummary extends Totals {
  year: number;
  month: number;
  weeks: WeekSummary[];
}

export function getMonthSummary(transactions: Transaction[], year: number, month: number): MonthSummary {
  const { start, end } = getMonthRange(year, month);
  const monthTx = inRange(transactions, start, end);
  const weeks = getWeeksInMonth(year, month).map((w) => {
    const weekTx = inRange(transactions, w.start, w.end);
    return { ...w, ...sumByType(weekTx) };
  });
  return { year, month, weeks, ...sumByType(monthTx) };
}

export function getYearSummary(transactions: Transaction[], year: number): { totals: Totals; months: MonthSummary[] } {
  const yearTx = transactions.filter((t) => new Date(t.date).getFullYear() === year);
  const months = Array.from({ length: 12 }, (_, m) => getMonthSummary(transactions, year, m))
    .filter((m) => m.income > 0 || m.expense > 0)
    .reverse();
  return { totals: sumByType(yearTx), months };
}

export function sumByAccount(transactions: Transaction[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    map.set(t.account, (map.get(t.account) ?? 0) + t.amount);
  }
  return map;
}
