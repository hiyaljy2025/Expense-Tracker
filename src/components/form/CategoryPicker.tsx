import { Modal } from '../common/Modal';

export function CategoryPicker({
  categories,
  onSelect,
  onClose,
}: {
  categories: string[];
  onSelect: (category: string) => void;
  onClose: () => void;
}) {
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
      </div>
    </Modal>
  );
}
