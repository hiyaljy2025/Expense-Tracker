import { useState } from 'react';
import { Delete, Minus, Plus } from 'lucide-react';

const STEP = 1;
const PAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'];

function splitSign(raw: string): { negative: boolean; unsigned: string } {
  return raw.startsWith('-') ? { negative: true, unsigned: raw.slice(1) } : { negative: false, unsigned: raw };
}

/** Formats a raw digit-entry string for display, always padded to 2 decimals: "2" -> "2.00", "2.4" -> "2.40". */
function formatAmountDisplay(raw: string): string {
  if (raw === '' || raw === '-') return raw;
  const { negative, unsigned } = splitSign(raw);
  const [intPart, decPart = ''] = unsigned.split('.');
  return `${negative ? '-' : ''}${intPart}.${decPart.padEnd(2, '0')}`;
}

/**
 * Amount entry: a tap target that opens a full-size on-screen numpad, plus +/- buttons for quick
 * nudges. `onChange` fires on every keystroke for live display; pass `onCommit` to additionally
 * fire only on a "finished editing" moment (stepper tap, or the pad's Done/backdrop dismiss) —
 * used by callers that persist the value immediately (e.g. account opening balance) so partial,
 * still-being-typed digits don't get written to storage. `allowNegative` enables a sign toggle,
 * for fields like opening balance where a negative value (e.g. a debt account) is meaningful.
 */
export function AmountField({
  value,
  onChange,
  onCommit,
  allowNegative = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onCommit?: (value: string) => void;
  allowNegative?: boolean;
}) {
  const [padOpen, setPadOpen] = useState(false);

  function adjust(delta: number) {
    const current = Number(value) || 0;
    const next = Math.round((current + delta) * 100) / 100;
    const clamped = allowNegative ? next : Math.max(0, next);
    const nextStr = String(clamped);
    onChange(nextStr);
    onCommit?.(nextStr);
  }

  function handlePadClose() {
    setPadOpen(false);
    onCommit?.(value);
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPadOpen(true)}
          className="min-w-0 flex-1 border-b border-gray-200 py-2 text-left text-lg font-semibold text-gray-700 outline-none focus:border-red-400"
        >
          {value ? formatAmountDisplay(value) : <span className="text-gray-400">0.00</span>}
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => adjust(-STEP)}
            aria-label="Decrease amount"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-600 active:bg-gray-200"
          >
            <Minus size={22} />
          </button>
          <button
            type="button"
            onClick={() => adjust(STEP)}
            aria-label="Increase amount"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-600 active:bg-gray-200"
          >
            <Plus size={22} />
          </button>
        </div>
      </div>

      {padOpen && (
        <NumpadOverlay value={value} onChange={onChange} onClose={handlePadClose} allowNegative={allowNegative} />
      )}
    </>
  );
}

function NumpadOverlay({
  value,
  onChange,
  onClose,
  allowNegative,
}: {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  allowNegative: boolean;
}) {
  /** Opening the pad on an existing amount (e.g. editing $45.50) shows it as a preview, not a value
   *  already "typed" here: the first digit/decimal press replaces it instead of appending onto it,
   *  so editing doesn't silently corrupt the amount (45.50 + "6" tap used to become 45.506). Pressing
   *  backspace first is treated as deliberately trimming the existing value, not starting fresh. */
  const [freshEntry, setFreshEntry] = useState(true);

  function press(key: string) {
    if (key === 'back') {
      setFreshEntry(false);
      const { negative, unsigned } = splitSign(value);
      const nextUnsigned = unsigned.slice(0, -1);
      onChange(nextUnsigned === '' ? '' : (negative ? '-' : '') + nextUnsigned);
      return;
    }
    if (key === '±') {
      // Toggles the sign of whatever is already shown, like backspace — not "start a new number".
      setFreshEntry(false);
      if (!allowNegative) return;
      const { negative, unsigned } = splitSign(value);
      if (unsigned === '') return;
      onChange((negative ? '' : '-') + unsigned);
      return;
    }
    const { negative, unsigned: currentUnsigned } = splitSign(value);
    const base = freshEntry ? '' : currentUnsigned;
    const sign = freshEntry ? false : negative;
    setFreshEntry(false);
    if (key === '.') {
      if (base.includes('.')) return;
      onChange((sign ? '-' : '') + (base === '' ? '0.' : base + '.'));
      return;
    }
    const decimals = base.split('.')[1];
    if (decimals && decimals.length >= 2) return;
    onChange((sign ? '-' : '') + (base === '' || base === '0' ? key : base + key));
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-2xl bg-white pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <span className="text-2xl font-semibold text-gray-800">{value ? formatAmountDisplay(value) : '0.00'}</span>
          <div className="flex items-center gap-2">
            {allowNegative && (
              <button
                type="button"
                onClick={() => press('±')}
                aria-label="Toggle negative"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-500"
              >
                ±
              </button>
            )}
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={!value}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-500 disabled:opacity-40"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-expense px-4 py-2 text-sm font-semibold text-white"
            >
              Done
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-px bg-gray-100 p-px">
          {PAD_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              aria-label={k === 'back' ? 'Backspace' : k}
              className="flex h-16 items-center justify-center bg-white text-xl font-medium text-gray-800 active:bg-gray-100"
            >
              {k === 'back' ? <Delete size={22} /> : k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
