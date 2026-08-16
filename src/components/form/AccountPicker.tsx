import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useTransactions } from '../../store/TransactionsContext';

export function AccountPicker({
  accounts,
  onSelect,
  onClose,
}: {
  accounts: string[];
  onSelect: (account: string) => void;
  onClose: () => void;
}) {
  const { addAccount } = useTransactions();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');

  function commitAdd() {
    const trimmed = name.trim();
    if (trimmed && !accounts.includes(trimmed)) {
      addAccount(trimmed);
      onSelect(trimmed);
    }
    setName('');
    setAdding(false);
  }

  return (
    <Modal onClose={onClose}>
      <div className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Select Account</h3>
        <div className="flex flex-col divide-y divide-gray-100">
          {accounts.map((a) => (
            <button key={a} onClick={() => onSelect(a)} className="py-3 text-left text-sm text-gray-700 hover:text-red-500">
              {a}
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
              placeholder="New account name"
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
            <Plus size={14} /> Add account
          </button>
        )}
      </div>
    </Modal>
  );
}
