import { useState, type ReactNode } from 'react';
import { Modal } from '../common/Modal';
import { TypeToggle } from './TypeToggle';
import { CategoryPicker } from './CategoryPicker';
import { AccountPicker } from './AccountPicker';
import { DateTimeField } from './DateTimeField';
import { useTransactions } from '../../store/TransactionsContext';
import { toDatetimeLocalValue } from '../../lib/dateUtils';
import type { Transaction, TransactionType } from '../../types';

interface Props {
  editing: Transaction | 'new';
  onClose: () => void;
}

export function TransactionForm({ editing, onClose }: Props) {
  const { expenseCategories, incomeCategories, accounts, addTransaction, updateTransaction, removeTransaction } =
    useTransactions();

  const isNew = editing === 'new';
  const [type, setType] = useState<TransactionType>(isNew ? 'expense' : editing.type);
  const [date, setDate] = useState(isNew ? toDatetimeLocalValue(new Date()) : toDatetimeLocalValue(new Date(editing.date)));
  const [amount, setAmount] = useState(isNew ? '' : String(editing.amount));
  const [category, setCategory] = useState(isNew ? '' : editing.category);
  const [account, setAccount] = useState(isNew ? '' : editing.account);
  const [note, setNote] = useState(isNew ? '' : (editing.note ?? ''));
  const [description, setDescription] = useState(isNew ? '' : (editing.description ?? ''));
  const [picker, setPicker] = useState<'category' | 'account' | null>(null);

  const categories = type === 'expense' ? expenseCategories : incomeCategories;
  const canSave = amount.trim() !== '' && !Number.isNaN(Number(amount)) && Number(amount) > 0 && category !== '' && account !== '';

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
      addTransaction(payload);
    } else {
      updateTransaction({ ...payload, id: editing.id });
    }
    onClose();
  }

  function handleDelete() {
    if (!isNew) removeTransaction(editing.id);
    onClose();
  }

  const accentColor = type === 'expense' ? 'bg-expense hover:bg-red-600' : 'bg-income hover:bg-teal-700';

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <button onClick={onClose} className="text-sm text-gray-500">
          Cancel
        </button>
        <h2 className="text-sm font-semibold text-gray-800">{isNew ? 'Add Transaction' : 'Edit Transaction'}</h2>
        {isNew ? <span className="w-12" /> : (
          <button onClick={handleDelete} className="text-sm text-expense">
            Delete
          </button>
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
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full border-b border-gray-200 py-2 text-sm text-gray-700 outline-none focus:border-red-400"
          />
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

        <button
          onClick={handleSave}
          disabled={!canSave}
          className={`mt-2 w-full rounded-lg py-3 text-sm font-semibold text-white disabled:opacity-40 ${accentColor}`}
        >
          Done
        </button>
      </div>

      {picker === 'category' && (
        <CategoryPicker
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
