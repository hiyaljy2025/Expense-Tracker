import type { CategoryAmount } from '../../lib/aggregate';

// Fixed-order categorical palette (validated for light-surface contrast + CVD separation).
// See dataviz skill reference/palette.md. "Other" uses a neutral gray, not a hue slot.
const CATEGORY_COLORS = [
  '#2a78d6', // blue
  '#eb6834', // orange
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#e87ba4', // magenta
  '#008300', // green
  '#4a3aa7', // violet
];
const OTHER_COLOR = '#9ca3af'; // gray-400

const MAX_SLOTS = 7;

export function CategoryBreakdownChart({ data }: { data: CategoryAmount[] }) {
  if (data.length === 0) {
    return <div className="py-6 text-center text-sm text-gray-400">No expenses this month yet.</div>;
  }

  const top = data.slice(0, MAX_SLOTS);
  const rest = data.slice(MAX_SLOTS);
  const otherAmount = rest.reduce((sum, c) => sum + c.amount, 0);
  const otherPct = rest.reduce((sum, c) => sum + c.pct, 0);
  const rows =
    otherAmount > 0
      ? [...top, { category: 'Other', amount: otherAmount, pct: otherPct }]
      : top;

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, i) => {
        const color = i < MAX_SLOTS ? CATEGORY_COLORS[i] : OTHER_COLOR;
        return (
          <div key={row.category}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-gray-700">
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                {row.category}
              </span>
              <span className="text-gray-500">
                <span className="font-medium text-gray-700">${row.amount.toFixed(2)}</span>{' '}
                <span className="text-gray-400">({row.pct.toFixed(0)}%)</span>
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100">
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${Math.max(row.pct, 1.5)}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
