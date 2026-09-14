import { type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

/**
 * Overlay action button used on canvas items (remove, swap layer).
 * Hidden by default (opacity-0) and revealed on parent group hover/focus.
 * The `compact` variant is used for small accessory items where space is tight.
 */
interface CanvasActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  compact?: boolean;
}

export function CanvasActionButton({
  className,
  compact = false,
  type = 'button',
  ...props
}: CanvasActionButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex items-center justify-center bg-[var(--bg-elevated)] text-[var(--text-primary)] opacity-0 transition-all duration-200',
        'group-hover:opacity-100 group-focus-within:opacity-100 hover:opacity-100 focus:opacity-100',
        'hover:bg-[var(--surface-inverse)] hover:text-[var(--text-inverse)]',
        'focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]',
        'disabled:cursor-not-allowed disabled:opacity-40',
        compact ? 'h-8 w-8' : 'h-10 w-10',
        className,
      )}
      {...props}
    />
  );
}
