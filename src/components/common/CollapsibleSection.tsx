import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function CollapsibleSection({
  title,
  defaultCollapsed = true,
  className = 'mt-2 bg-white px-4 py-3',
  headerClassName = 'mb-2',
  titleClassName = 'text-sm font-semibold text-gray-700',
  children,
}: {
  title: ReactNode;
  defaultCollapsed?: boolean;
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className={`flex w-full items-center justify-between gap-1 ${headerClassName}`}
      >
        <span className={`flex items-center gap-1 ${titleClassName}`}>{title}</span>
        {collapsed ? (
          <ChevronDown size={16} className="shrink-0 text-gray-400" />
        ) : (
          <ChevronUp size={16} className="shrink-0 text-gray-400" />
        )}
      </button>
      {!collapsed && children}
    </div>
  );
}
