import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useTransactions } from '../../store/TransactionsContext';
import { AmountField } from '../form/AmountField';

export function AccountListEditor() {
  const { accounts, accountOpeningBalances, addAccount, renameAccount, removeAccount, setAccountOpeningBalance } =
    useTransactions();
  const [editingName, setEditingName] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [balanceDrafts, setBalanceDrafts] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('0');

  function commitRename(oldName: string) {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== oldName && !accounts.includes(trimmed)) {
      renameAccount(oldName, trimmed);
    }
    setEditingName(null);
  }

  function handleBalanceChange(name: string, value: string) {
    setBalanceDrafts((prev) => ({ ...prev, [name]: value }));
  }

  /** Commits once editing finishes (pad closed, or a stepper tap) rather than on every keystroke,
   *  then drops the draft so the field goes back to reading straight from the committed store value
   *  — otherwise a stale draft would keep masking it (e.g. after restoring a JSON backup). */
  function commitBalance(name: string, value: string) {
    setAccountOpeningBalance(name, Number(value) || 0);
    setBalanceDrafts((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function commitAdd() {
    const trimmed = newName.trim();
    if (trimmed && !accounts.includes(trimmed)) {
      addAccount(trimmed, Number(newBalance) || 0);
    }
    setNewName('');
    setNewBalance('0');
    setAdding(false);
  }

  function handleDelete(name: string) {
    if (window.confirm(`Remove account "${name}"? Existing transactions keep this account name.`)) {
      removeAccount(name);
    }
  }

  return (
    <div className="mb-4">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Accounts</h4>
      <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
        {accounts.map((a) => (
          <div key={a} className="px-3 py-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              {editingName === a ? (
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => commitRename(a)}
                  onKeyDown={(e) => e.key === 'Enter' && commitRename(a)}
                  className="flex-1 rounded border border-gray-200 px-2 py-1 text-sm outline-none focus:border-red-400"
                />
              ) : (
                <span className="flex-1 text-gray-700">{a}</span>
              )}
              <div className="flex shrink-0 gap-2 text-gray-400">
                <button
                  onClick={() => {
                    setEditingName(a);
                    setDraft(a);
                  }}
                  aria-label={`Rename ${a}`}
                >
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(a)} aria-label={`Delete ${a}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="mt-2">
              <span className="mb-1 block text-xs text-gray-400">Opening balance</span>
              <AmountField
                value={balanceDrafts[a] ?? String(accountOpeningBalances[a] ?? 0)}
                onChange={(v) => handleBalanceChange(a, v)}
                onCommit={(v) => commitBalance(a, v)}
                allowNegative
              />
            </div>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="mt-2 rounded-lg border border-gray-200 p-3">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New account"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-400"
          />
          <div className="mt-2">
            <span className="mb-1 block text-xs text-gray-400">Opening balance</span>
            <AmountField value={newBalance} onChange={setNewBalance} allowNegative />
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => {
                setAdding(false);
                setNewName('');
                setNewBalance('0');
              }}
              className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600"
            >
              Cancel
            </button>
            <button onClick={commitAdd} className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-medium text-white">
              Add
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-2 flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-500"
        >
          <Plus size={14} /> Add account
        </button>
      )}
    </div>
  );
}
