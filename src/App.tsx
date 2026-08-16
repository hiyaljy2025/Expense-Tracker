import { useState } from 'react';
import { TransactionsProvider } from './store/TransactionsContext';
import { TabBar, type TabKey } from './components/layout/TabBar';
import { TransactionForm } from './components/form/TransactionForm';
import { DailyTab } from './tabs/DailyTab';
import { CalendarTab } from './tabs/CalendarTab';
import { WeeklyMonthlyTab } from './tabs/WeeklyMonthlyTab';
import { TotalTab } from './tabs/TotalTab';
import type { Transaction } from './types';

function AppShell() {
  const [tab, setTab] = useState<TabKey>('daily');
  const [editing, setEditing] = useState<Transaction | 'new' | null>(null);
  const [dailyFocusDay, setDailyFocusDay] = useState<string | null>(null);

  function goToDay(dayKey: string) {
    setDailyFocusDay(dayKey);
    setTab('daily');
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-gray-50 shadow-sm">
      <header className="bg-white px-4 py-3">
        <h1 className="text-lg font-bold text-gray-800">Expense Tracker</h1>
      </header>

      <TabBar active={tab} onChange={setTab} />

      {tab === 'daily' && (
        <DailyTab
          onAdd={() => setEditing('new')}
          onEdit={(t) => setEditing(t)}
          focusDay={dailyFocusDay}
          onClearFocus={() => setDailyFocusDay(null)}
        />
      )}
      {tab === 'calendar' && <CalendarTab onSelectDay={goToDay} />}
      {tab === 'weekly' && <WeeklyMonthlyTab />}
      {tab === 'total' && <TotalTab onEditTransaction={(t) => setEditing(t)} />}

      {editing !== null && <TransactionForm editing={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function App() {
  return (
    <TransactionsProvider>
      <AppShell />
    </TransactionsProvider>
  );
}

export default App;
