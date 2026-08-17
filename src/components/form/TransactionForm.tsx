import { useState, type ReactNode } from 'react';
import { Modal } from '../common/Modal';
import { TypeToggle } from './TypeToggle';
import { CategoryPicker } from './CategoryPicker';
import { AccountPicker } from './AccountPicker';
import { DateTimeField } from './DateTimeField';
import { AmountField } from './AmountField';
import { RecurrencePanel, RecurrenceToggleButton, type RecurrenceState } from './RecurrenceField';
import { useTransactions } from '../../store/TransactionsContext';
import { toDatetimeLocalValue } from '../../lib/dateUtils';
import { generateSeries } from '../../lib/recurrence';
import type { Transaction, TransactionType } from '../../types';

interface Props {
  editing: Transaction | 'new';
  onClose: () => void;
  /** 'forecast' reuses this exact form to plan future income/expense, stored separately from real transactions. */
  kind?: 'transaction' | 'forecast';
}

export function TransactionForm({ editing, onClose, kind = 'transaction' }: Props) {
  const {
    expenseCategories,
    incomeCategories,
    accounts,
    addTransaction,
    addTransactionSeries,
    updateTransaction,
    removeTransaction,
    removeSeries,
    addForecastEntry,
    addForecastSeries,
    updateForecastEntry,
    removeForecastEntry,
    removeForecastSeries,
  } = useTransactions();

  const isForecast = kind === 'forecast';
  const entryLabel = isForecast ? 'forecast entry' : 'transaction';
  const isNew = editing === 'new';
  const [type, setType] = useState<TransactionType>(isNew ? 'expense' : editing.type);
  const [date, setDate] = useState(isNew ? toDatetimeLocalValue(new Date()) : toDatetimeLocalValue(new Date(editing.date)));
  const [amount, setAmount] = useState(isNew ? '' : String(editing.amount));
  const [category, setCategory] = useState(isNew ? '' : editing.category);
  const [account, setAccount] = useState(isNew ? '' : editing.account);
  const [note, setNote] = useState(isNew ? '' : (editing.note ?? ''));
  const [description, setDescription] = useState(isNew ? '' : (editing.description ?? ''));
  const [picker, setPicker] = useState<'category' | 'account' | null>(null);
  const [recurrence, setRecurrence] = useState<RecurrenceState>({ enabled: false, frequency: 'monthly', occurrences: 3 });

  const categories = type === 'expense' ? expenseCategories : incomeCategories;
  const canSave = amount.trim() !== '' && !Number.isNaN(Number(amount)) && Number(amount) >= 0 && category !== '' && account !== '';

  function handleSave() {
    if (!canSave) return;
    const payload = {
      type,
      date: new Date(date).toISOString(),
      amount: Number(amount),
      category,
      account,
      note: note || undefined,
      description: description || undefined,
    };
    if (isNew) {
      if (recurrence.enabled) {
        const series = generateSeries(payload, recurrence.frequency, recurrence.occurrences);
        if (isForecast) addForecastSeries(series);
        else addTransactionSeries(series);
      } else if (isForecast) {
        addForecastEntry(payload);
      } else {
        addTransaction(payload);
      }
    } else {
      const updated = { ...payload, id: editing.id, seriesId: editing.seriesId };
      if (isForecast) updateForecastEntry(updated);
      else updateTransaction(updated);
    }
    onClose();
  }

  function handleDelete() {
    if (isNew) return;
    if (!window.confirm(`Delete this ${entryLabel}? This cannot be undone.`)) return;
    if (isForecast) removeForecastEntry(editing.id);
    else removeTransaction(editing.id);
    onClose();
  }

  function handleDeleteSeries() {
    if (isNew || !editing.seriesId) return;
    if (!window.confirm('Delete this and every other occurrence in this repeating series? This cannot be undone.'))
      return;
    if (isForecast) removeForecastSeries(editing.seriesId);
    else removeSeries(editing.seriesId);
    onClose();
  }

  const accentColor = type === 'expense' ? 'bg-expense hover:bg-red-600' : 'bg-income hover:bg-teal-700';

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <span className="w-12" />
        <h2 className="text-sm font-semibold text-gray-800">
          {isForecast
            ? isNew
              ? 'Add Forecast Entry'
              : 'Edit Forecast Entry'
            : isNew
              ? 'Add Transaction'
              : 'Edit Transaction'}
        </h2>
        {isNew ? (
          <RecurrenceToggleButton
            active={recurrence.enabled}
            onClick={() => setRecurrence((r) => ({ ...r, enabled: !r.enabled }))}
          />
        ) : (
          <span className="w-12" />
        )}
      </div>

      <TypeToggle
        value={type}
        onChange={(v) => {
          setType(v);
          setCategory('');
        }}
      />

      <div className="flex flex-col gap-4 px-4 pb-4">
        <Field label="Date">
          <DateTimeField value={date} onChange={setDate} />
        </Field>

        <Field label="Amount">
          <AmountField value={amount} onChange={setAmount} />
        </Field>

        <Field label="Category">
          <button
            onClick={() => setPicker('category')}
            className="w-full border-b border-gray-200 py-2 text-left text-sm text-gray-700"
          >
            {category || <span className="text-gray-400">Select category</span>}
          </button>
        </Field>

        <Field label="Account">
          <button
            onClick={() => setPicker('account')}
            className="w-full border-b border-gray-200 py-2 text-left text-sm text-gray-700"
          >
            {account || <span className="text-gray-400">Select account</span>}
          </button>
        </Field>

        <Field label="Note">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border-b border-gray-200 py-2 text-sm text-gray-700 outline-none focus:border-red-400"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full resize-none border-b border-gray-200 py-2 text-sm text-gray-700 outline-none focus:border-red-400"
          />
        </Field>

        {isNew && <RecurrencePanel value={recurrence} onChange={setRecurrence} />}

        {!isNew && (
          <div className="mt-2 flex gap-2">
            {editing.seriesId && (
              <button
                onClick={handleDeleteSeries}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-500 active:bg-gray-100"
              >
                Delete recurring
              </button>
            )}
            <button
              onClick={handleDelete}
              className="flex-1 rounded-lg border border-expense py-2.5 text-sm font-medium text-expense active:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}

        <div className="mt-2 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 py-3 text-sm font-semibold text-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`flex-[2] rounded-lg py-3 text-sm font-semibold text-white disabled:opacity-40 ${accentColor}`}
          >
            {isNew ? 'Done' : 'Done (Edit)'}
          </button>
        </div>
      </div>

      {picker === 'category' && (
        <CategoryPicker
          kind={type}
          categories={categories}
          onSelect={(c) => {
            setCategory(c);
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
        />
      )}
      {picker === 'account' && (
        <AccountPicker
          accounts={accounts}
          onSelect={(a) => {
            setAccount(a);
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
        />
      )}
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-400">{label}</span>
      {children}
    </label>
  );
}
