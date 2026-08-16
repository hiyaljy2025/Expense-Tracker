import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useTransactions, type CategoryKind } from '../../store/TransactionsContext';

export function CategoryPicker({
  kind,
  categories,
  onSelect,
  onClose,
}: {
  kind: CategoryKind;
  categories: string[];
  onSelect: (category: string) => void;
  onClose: () => void;
}) {
  const { addCategory } = useTransactions();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');

  function commitAdd() {
    const trimmed = name.trim();
    if (trimmed && !categories.includes(trimmed)) {
      addCategory(kind, trimmed);
      onSelect(trimmed);
    }
    setName('');
    setAdding(false);
  }

  return (
    <Modal onClose={onClose}>
      <div className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Select Category</h3>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => onSelect(c)}
              className="rounded-lg border border-gray-200 py-3 text-sm text-gray-700 hover:border-red-400 hover:text-red-500"
            >
              {c}
            </button>
          ))}
        </div>

        {adding ? (
          <div className="mt-3 flex gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && commitAdd()}
              placeholder="New category name"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-400"
            />
            <button onClick={commitAdd} className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white">
              Add
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-red-400 hover:text-red-500"
          >
            <Plus size={14} /> Add category
          </button>
        )}
      </div>
    </Modal>
  );
}
