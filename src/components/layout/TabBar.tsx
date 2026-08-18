export type TabKey = 'daily' | 'calendar' | 'weekly' | 'total' | 'reminders' | 'forecast';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'weekly', label: 'Weekly/Monthly' },
  { key: 'total', label: 'Statistics' },
  { key: 'reminders', label: 'Reminders' },
  { key: 'forecast', label: 'Forecast' },
];

export function TabBar({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <div className="flex overflow-x-auto border-b border-gray-200 bg-white">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 whitespace-nowrap px-1 py-3 text-[11px] font-medium sm:text-sm ${
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
