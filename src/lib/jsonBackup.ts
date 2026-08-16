import type { AppState } from '../types';
import { serializeState } from './storage';
import { todayStamp } from './dateUtils';

export function exportToJson(state: AppState): void {
  const blob = new Blob([serializeState(state)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expense-tracker-backup-${todayStamp()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
