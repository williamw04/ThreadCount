import { type KeyboardEvent, type ReactNode } from 'react';
import { clsx } from 'clsx';

/**
 * Reusable shell for each canvas slot (top, bottom, shoes, accessories).
 *
 * Handles keyboard accessibility (Enter/Space to select), focus styling,
 * and visual state (empty vs filled, selected vs unselected).
 * Empty slots show a subtle crosshatch grid pattern via CSS background gradient
 * to indicate they're interactive targets.
 */
interface CanvasSlotShellProps {
  children?: ReactNode;
  className?: string;
  heightClassName?: string;
  isFilled?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export function CanvasSlotShell({
  children,
  className,
  heightClassName,
  isFilled = false,
  isSelected = false,
  onClick,
}: CanvasSlotShellProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={clsx(
        'group relative w-full overflow-hidden text-left transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]',
        heightClassName,
        isSelected
          ? 'bg-[color:rgba(251,251,248,0.9)]'
          : 'bg-[color:rgba(251,251,248,0.4)] hover:bg-[color:rgba(251,251,248,0.72)]',
        className,
      )}
    >
      <div
        className={clsx(
          'relative h-full min-h-0 w-full',
          !isFilled &&
            'bg-[linear-gradient(135deg,rgba(17,17,17,0.03)_0,rgba(17,17,17,0.03)_1px,transparent_1px,transparent_100%)] bg-[length:18px_18px]',
        )}
      >
        <div className="h-full min-h-0">{children}</div>
      </div>
    </div>
  );
}
