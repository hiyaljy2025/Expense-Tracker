import { Plus } from 'lucide-react';

export function FloatingAddButton({ onClick, label = 'Add transaction' }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600"
    >
      <Plus size={28} />
    </button>
  );
}
