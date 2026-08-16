import { useRef } from 'react';
import { Modal } from '../common/Modal';
import { CategoryListEditor } from './CategoryListEditor';
import { AccountListEditor } from './AccountListEditor';
import { useTransactions } from '../../store/TransactionsContext';
import { exportToJson } from '../../lib/jsonBackup';
import { parseImportedState } from '../../lib/storage';

export function ManageDataModal({ onClose }: { onClose: () => void }) {
  const state = useTransactions();
  const { replaceState } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const parsed = parseImportedState(text);
      if (!parsed) {
        window.alert('That file doesn\'t look like a valid backup.');
        return;
      }
      if (window.confirm('Restoring will replace all current data with the contents of this backup. Continue?')) {
        replaceState(parsed);
        onClose();
      }
    };
    reader.readAsText(file);
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <button onClick={onClose} className="text-sm text-gray-500">
          Close
        </button>
        <h2 className="text-sm font-semibold text-gray-800">Manage Data</h2>
        <span className="w-12" />
      </div>

      <div className="max-h-[70vh] overflow-y-auto px-4 py-4">
        <CategoryListEditor kind="expense" title="Expense Categories" />
        <CategoryListEditor kind="income" title="Income Categories" />
        <AccountListEditor />

        <div className="mt-2 border-t border-gray-100 pt-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Backup &amp; Restore</h4>
          <div className="flex gap-2">
            <button
              onClick={() => exportToJson(state)}
              className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Backup (JSON)
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Restore (JSON)
            </button>
            <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
