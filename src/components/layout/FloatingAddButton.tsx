import { Plus } from 'lucide-react';

/**
 * `sticky` anchors the button just past the end of its scrolling content instead of the viewport
 * corner, so on short lists it sits near the last entry instead of floating far below it. Kept at
 * z-30 (above ScrollSlider's z-20) so the two never fight over a tap regardless of where they land.
 */
export function FloatingAddButton({
  onClick,
  label = 'Add transaction',
  sticky = false,
}: {
  onClick: () => void;
  label?: string;
  sticky?: boolean;
}) {
  return (
    <div className={sticky ? 'sticky bottom-6 z-30 flex justify-end px-6' : 'fixed bottom-6 right-6 z-30'}>
      <button
        onClick={onClick}
        aria-label={label}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
