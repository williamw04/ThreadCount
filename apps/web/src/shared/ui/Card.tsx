import { type HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-5',
  md: 'p-8',
  lg: 'p-10',
};

/**
 * Surface container following the visual-style.md card spec:
 * "Flat or minimally elevated. Borders matter more than shadow."
 *
 * Uses CSS variables for border, background, and shadow so the card
 * respects any theme overrides. The shadow-panel token provides the
 * minimal elevation described in the style guide.
 */
export function Card({ padding = 'md', className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow-panel)]',
        paddingStyles[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
