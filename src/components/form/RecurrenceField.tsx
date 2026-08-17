import { Minus, Plus, Repeat } from 'lucide-react';
import type { RecurrenceFrequency } from '../../types';

export interface RecurrenceState {
  enabled: boolean;
  frequency: RecurrenceFrequency;
  occurrences: number;
}

export function RecurrenceToggleButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
        active ? 'bg-red-50 text-expense' : 'text-gray-400'
      }`}
      title="Repeat / Installment"
    >
      <Repeat size={16} />
      <span className="hidden sm:inline">Rep/Inst.</span>
    </button>
  );
}

export function RecurrencePanel({
  value,
  onChange,
}: {
  value: RecurrenceState;
  onChange: (v: RecurrenceState) => void;
}) {
  if (!value.enabled) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="mb-2 text-xs font-medium text-gray-500">Repeats</div>
      <div className="flex gap-2">
        {(['weekly', 'monthly'] as RecurrenceFrequency[]).map((f) => (
          <button
            key={f}
            onClick={() => onChange({ ...value, frequency: f })}
            className={`flex-1 rounded-lg border py-2 text-sm capitalize ${
              value.frequency === f ? 'border-expense bg-expense-light text-expense' : 'border-gray-200 text-gray-500'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="mt-3">
        <span className="mb-1 block text-xs font-medium text-gray-400">Number of occurrences (including this one)</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...value, occurrences: Math.max(2, value.occurrences - 1) })}
            aria-label="Decrease occurrences"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 active:bg-gray-200"
          >
            <Minus size={22} />
          </button>
          <span className="flex-1 rounded-lg border border-gray-200 bg-white py-2 text-center text-lg font-semibold text-gray-700">
            {value.occurrences}
          </span>
          <button
            type="button"
            onClick={() => onChange({ ...value, occurrences: Math.min(52, value.occurrences + 1) })}
            aria-label="Increase occurrences"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 active:bg-gray-200"
          >
            <Plus size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
