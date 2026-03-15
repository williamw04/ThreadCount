import { type ReactNode } from 'react';
import { clsx } from 'clsx';

interface CanvasSlotShellProps {
  children?: ReactNode;
  className?: string;
  heightClassName?: string;
  isFilled?: boolean;
  isSelected?: boolean;
  label: string;
  meta?: string;
  onClick?: () => void;
}

export function CanvasSlotShell({
  children,
  className,
  heightClassName,
  isFilled = false,
  isSelected = false,
  label,
  meta,
  onClick,
}: CanvasSlotShellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'group relative w-full overflow-hidden border text-left transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]',
        heightClassName,
        isSelected
          ? 'border-[var(--border-strong)] bg-[var(--bg-elevated)] shadow-[0_0_0_1px_var(--border-strong)]'
          : 'border-[var(--border)] bg-[color:rgba(251,251,248,0.58)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)]',
        className,
      )}
    >
      <div className="absolute left-0 top-0 z-10 border-r border-b border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5">
        <p className="eyebrow text-[var(--text-muted)]">{label}</p>
        {meta ? <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--text-secondary)]">{meta}</p> : null}
      </div>

      <div
        className={clsx(
          'relative h-full min-h-0 w-full pt-12',
          !isFilled && 'bg-[linear-gradient(135deg,rgba(17,17,17,0.03)_0,rgba(17,17,17,0.03)_1px,transparent_1px,transparent_100%)] bg-[length:18px_18px]',
        )}
      >
        <div className="h-full min-h-0">{children}</div>
      </div>
    </button>
  );
}
