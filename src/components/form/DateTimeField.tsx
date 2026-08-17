import { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  dayKey,
  formatFullDate,
  formatMonthYear,
  formatTime12,
  getMonthGridDays,
  isSameMonth,
  isToday,
  toDatetimeLocalValue,
} from '../../lib/dateUtils';

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function parseValue(value: string): Date {
  const d = value ? new Date(value) : new Date();
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function formatDisplay(value: string): string {
  const d = parseValue(value);
  return `${formatFullDate(d)}, ${formatTime12(d)}`;
}

export function DateTimeField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between border-b border-gray-200 py-2 text-left text-sm text-gray-700 outline-none focus:border-red-400"
      >
        <span>{value ? formatDisplay(value) : <span className="text-gray-400">Select date &amp; time</span>}</span>
        <CalendarIcon size={18} className="shrink-0 text-gray-400" />
      </button>

      {open && <DateTimeOverlay value={value} onChange={onChange} onClose={() => setOpen(false)} />}
    </>
  );
}

function DateTimeOverlay({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
}) {
  const selected = parseValue(value);
  const [cursor, setCursor] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
  const [hour12, setHour12] = useState(selected.getHours() % 12 || 12);
  const [minutes, setMinutes] = useState(selected.getMinutes());
  const [period, setPeriod] = useState<'AM' | 'PM'>(selected.getHours() >= 12 ? 'PM' : 'AM');

  const gridDays = useMemo(() => getMonthGridDays(cursor.getFullYear(), cursor.getMonth()), [cursor]);

  function to24Hour(h12: number, p: 'AM' | 'PM'): number {
    const base = h12 % 12;
    return p === 'PM' ? base + 12 : base;
  }

  function commit(day: Date, h24: number, min: number) {
    onChange(toDatetimeLocalValue(new Date(day.getFullYear(), day.getMonth(), day.getDate(), h24, min)));
  }

  function handleHourSlider(h12: number) {
    setHour12(h12);
    commit(selected, to24Hour(h12, period), minutes);
  }

  function handleMinuteSlider(min: number) {
    setMinutes(min);
    commit(selected, to24Hour(hour12, period), min);
  }

  function handlePeriodChange(p: 'AM' | 'PM') {
    setPeriod(p);
    commit(selected, to24Hour(hour12, p), minutes);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-2xl bg-white pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <span className="text-base font-semibold text-gray-800">{formatFullDate(selected)}</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-expense px-4 py-2 text-sm font-semibold text-white"
          >
            Done
          </button>
        </div>

        <div className="flex items-center justify-between px-4 py-2">
          <button
            type="button"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="p-1 text-gray-500"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-semibold text-gray-800">
            {formatMonthYear(cursor.getFullYear(), cursor.getMonth())}
          </span>
          <button
            type="button"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="p-1 text-gray-500"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs text-gray-400">
          {WEEKDAY_LABELS.map((w) => (
            <div key={w} className="py-1">
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 px-2 pb-2">
          {gridDays.map((d) => {
            const inMonth = isSameMonth(d, cursor.getFullYear(), cursor.getMonth());
            const isSelected = dayKey(d) === dayKey(selected);
            return (
              <button
                key={dayKey(d)}
                type="button"
                onClick={() => commit(d, to24Hour(hour12, period), minutes)}
                className={`m-0.5 flex h-10 items-center justify-center rounded-full text-sm ${
                  isSelected
                    ? 'bg-expense font-semibold text-white'
                    : isToday(d)
                      ? 'font-semibold text-expense'
                      : inMonth
                        ? 'text-gray-700'
                        : 'text-gray-300'
                }`}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>

        <div className="border-t border-gray-100 px-4 py-3">
          <div className="mb-3 text-center text-2xl font-semibold text-gray-800">
            {String(hour12).padStart(2, '0')}:{String(minutes).padStart(2, '0')}{' '}
            <span className="text-base font-medium text-gray-500">{period}</span>
          </div>

          <label className="mb-3 block">
            <span className="mb-1 flex items-center justify-between text-xs font-medium text-gray-400">
              <span>Hour</span>
              <span>{hour12}</span>
            </span>
            <input
              type="range"
              min={1}
              max={12}
              step={1}
              value={hour12}
              onChange={(e) => handleHourSlider(Number(e.target.value))}
              className="h-8 w-full accent-expense"
            />
          </label>

          <label className="mb-3 block">
            <span className="mb-1 flex items-center justify-between text-xs font-medium text-gray-400">
              <span>Minute</span>
              <span>{minutes}</span>
            </span>
            <input
              type="range"
              min={0}
              max={59}
              step={1}
              value={minutes}
              onChange={(e) => handleMinuteSlider(Number(e.target.value))}
              className="h-8 w-full accent-expense"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handlePeriodChange('AM')}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium ${
                period === 'AM' ? 'border-expense bg-expense-light text-expense' : 'border-gray-200 text-gray-500'
              }`}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => handlePeriodChange('PM')}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium ${
                period === 'PM' ? 'border-expense bg-expense-light text-expense' : 'border-gray-200 text-gray-500'
              }`}
            >
              PM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
