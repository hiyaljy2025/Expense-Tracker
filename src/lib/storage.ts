import type { AppState } from '../types';
import { createDefaultState } from '../data/defaults';

const STORAGE_KEY = 'expense-tracker:v1';

export function loadState(): AppState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createDefaultState();
  try {
    const parsed = JSON.parse(raw) as Partial<AppState> | null;
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.transactions)) {
      return createDefaultState();
    }
    // Merge onto defaults so fields added in later versions of the app
    // (e.g. accountOpeningBalances) are backfilled instead of wiping existing data.
    return { ...createDefaultState(), ...parsed };
  } catch {
    return createDefaultState();
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function serializeState(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function parseImportedState(json: string): AppState | null {
  try {
    const parsed = JSON.parse(json) as Partial<AppState> | null;
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.transactions)) return null;
    return { ...createDefaultState(), ...parsed };
  } catch {
    return null;
  }
}
