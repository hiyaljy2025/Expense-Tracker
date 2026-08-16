import { Modal } from '../common/Modal';

export function AccountPicker({
  accounts,
  onSelect,
  onClose,
}: {
  accounts: string[];
  onSelect: (account: string) => void;
  onClose: () => void;
}) {
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
      </div>
    </Modal>
  );
}
