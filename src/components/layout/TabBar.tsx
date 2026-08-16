export type TabKey = 'daily' | 'calendar' | 'weekly' | 'total';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'weekly', label: 'Weekly/Monthly' },
  { key: 'total', label: 'Total' },
];

export function TabBar({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <div className="flex border-b border-gray-200 bg-white">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 py-3 text-xs font-medium sm:text-sm ${
            active === tab.key
              ? 'border-b-2 border-red-500 text-red-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
