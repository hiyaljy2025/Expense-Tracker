import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useTransactions, type CategoryKind } from '../../store/TransactionsContext';

export function CategoryListEditor({ kind, title }: { kind: CategoryKind; title: string }) {
  const { expenseCategories, incomeCategories, addCategory, renameCategory, removeCategory } = useTransactions();
  const categories = kind === 'expense' ? expenseCategories : incomeCategories;
  const [editingName, setEditingName] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  function commitRename(oldName: string) {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== oldName && !categories.includes(trimmed)) {
      renameCategory(kind, oldName, trimmed);
    }
    setEditingName(null);
  }

  function commitAdd() {
    const trimmed = newName.trim();
    if (trimmed && !categories.includes(trimmed)) addCategory(kind, trimmed);
    setNewName('');
    setAdding(false);
  }

  function handleDelete(name: string) {
    if (window.confirm(`Remove category "${name}"? Existing transactions keep this category name.`)) {
      removeCategory(kind, name);
    }
  }

  return (
    <div className="mb-4">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</h4>
      <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
        {categories.map((c) => (
          <div key={c} className="flex items-center justify-between px-3 py-2 text-sm">
            {editingName === c ? (
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => commitRename(c)}
                onKeyDown={(e) => e.key === 'Enter' && commitRename(c)}
                className="flex-1 rounded border border-gray-200 px-2 py-1 text-sm outline-none focus:border-red-400"
              />
            ) : (
              <span className="text-gray-700">{c}</span>
            )}
            <div className="flex gap-2 text-gray-400">
              <button
                onClick={() => {
                  setEditingName(c);
                  setDraft(c);
                }}
                aria-label={`Rename ${c}`}
              >
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(c)} aria-label={`Delete ${c}`}>
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
            onKeyDown={(e) => e.key === 'Enter' && commitAdd()}
            placeholder="New category"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-400"
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
          <Plus size={14} /> Add category
        </button>
      )}
    </div>
  );
}
