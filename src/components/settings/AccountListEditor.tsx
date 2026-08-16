import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useTransactions } from '../../store/TransactionsContext';

export function AccountListEditor() {
  const { accounts, accountOpeningBalances, addAccount, renameAccount, removeAccount, setAccountOpeningBalance } =
    useTransactions();
  const [editingName, setEditingName] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
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
          <div key={a} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
            <div className="flex-1">
              {editingName === a ? (
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => commitRename(a)}
                  onKeyDown={(e) => e.key === 'Enter' && commitRename(a)}
                  className="w-full rounded border border-gray-200 px-2 py-1 text-sm outline-none focus:border-red-400"
                />
              ) : (
                <span className="text-gray-700">{a}</span>
              )}
              <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                Opening balance:
                <input
                  type="number"
                  step="0.01"
                  defaultValue={accountOpeningBalances[a] ?? 0}
                  onBlur={(e) => setAccountOpeningBalance(a, Number(e.target.value) || 0)}
                  className="w-20 rounded border border-gray-200 px-1 py-0.5 text-xs outline-none focus:border-red-400"
                />
              </div>
            </div>
            <div className="flex gap-2 text-gray-400">
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
        ))}
      </div>

      {adding ? (
        <div className="mt-2 flex gap-2">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New account"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-400"
          />
          <input
            type="number"
            step="0.01"
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
            placeholder="Opening $"
            className="w-24 rounded-lg border border-gray-200 px-2 py-2 text-sm outline-none focus:border-red-400"
          />
          <button onClick={commitAdd} className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white">
            Add
          </button>
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
