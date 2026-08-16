import * as XLSX from 'xlsx';
import type { Transaction } from '../types';
import { formatDate, formatTime, todayStamp } from './dateUtils';

export function exportToExcel(transactions: Transaction[]): void {
  const rows = transactions
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((t) => ({
      Date: formatDate(t.date),
      Time: formatTime(t.date),
      Type: t.type === 'income' ? 'Income' : 'Expense',
      Category: t.category,
      Account: t.account,
      Amount: t.amount,
      Note: t.note ?? '',
      Description: t.description ?? '',
    }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  XLSX.writeFile(workbook, `expense-tracker-export-${todayStamp()}.xlsx`);
}
