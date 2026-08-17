import { useState, type ReactNode } from 'react';
import { Modal } from '../common/Modal';
import { CategoryPicker } from '../form/CategoryPicker';
import { AccountPicker } from '../form/AccountPicker';
import { AmountField } from '../form/AmountField';
import { useTransactions } from '../../store/TransactionsContext';
import { toDateInputValue } from '../../lib/dateUtils';
import type { BillFrequency, BillReminder } from '../../types';

interface Props {
  editing: BillReminder | 'new';
  onClose: () => void;
}

const FREQUENCIES: { value: BillFrequency; label: string }[] = [
  { value: 'once', label: 'Once' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export function ReminderForm({ editing, onClose }: Props) {
  const { expenseCategories, accounts, addReminder, updateReminder, removeReminder } = useTransactions();
  const isNew = editing === 'new';

  const [name, setName] = useState(isNew ? '' : editing.name);
  const [amount, setAmount] = useState(isNew ? '' : String(editing.amount));
  const [category, setCategory] = useState(isNew ? '' : editing.category);
  const [account, setAccount] = useState(isNew ? '' : editing.account);
  const [frequency, setFrequency] = useState<BillFrequency>(isNew ? 'monthly' : editing.frequency);
  const [dueDate, setDueDate] = useState(isNew ? toDateInputValue(new Date()) : editing.dueDate);
  const [note, setNote] = useState(isNew ? '' : (editing.note ?? ''));
  const [picker, setPicker] = useState<'category' | 'account' | null>(null);

  const canSave =
    name.trim() !== '' &&
    amount.trim() !== '' &&
    !Number.isNaN(Number(amount)) &&
    Number(amount) > 0 &&
    category !== '' &&
    account !== '' &&
    dueDate !== '';

  function handleSave() {
    if (!canSave) return;
    const payload = {
      name: name.trim(),
      amount: Number(amount),
      category,
      account,
      frequency,
      dueDate,
      note: note || undefined,
    };
    if (isNew) {
      addReminder(payload);
    } else {
      updateReminder({ ...payload, id: editing.id });
    }
    onClose();
  }

  function handleDelete() {
    if (isNew) return;
    if (window.confirm(`Delete the reminder "${editing.name}"? This cannot be undone.`)) {
      removeReminder(editing.id);
      onClose();
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <span className="w-12" />
        <h2 className="text-sm font-semibold text-gray-800">{isNew ? 'Add Reminder' : 'Edit Reminder'}</h2>
        {isNew ? (
          <span className="w-12" />
        ) : (
          <button onClick={handleDelete} className="text-sm text-expense">
            Delete
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 px-4 py-4">
        <Field label="Bill Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Electricity"
            className="w-full border-b border-gray-200 py-2 text-sm text-gray-700 outline-none focus:border-red-400"
          />
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

        <Field label="Repeats">
          <div className="flex gap-2">
            {FREQUENCIES.map((f) => (
              <button
                key={f.value}
                onClick={() => setFrequency(f.value)}
                className={`flex-1 rounded-lg border py-2 text-xs font-medium ${
                  frequency === f.value ? 'border-expense bg-expense-light text-expense' : 'border-gray-200 text-gray-500'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label={isNew || editing.frequency === 'once' ? 'Due Date' : 'Next Due Date'}>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full border-b border-gray-200 py-2 text-sm text-gray-700 outline-none focus:border-red-400"
          />
        </Field>

        <Field label="Note">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border-b border-gray-200 py-2 text-sm text-gray-700 outline-none focus:border-red-400"
          />
        </Field>

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
            className="flex-[2] rounded-lg bg-expense py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>

      {picker === 'category' && (
        <CategoryPicker
          kind="expense"
          categories={expenseCategories}
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
