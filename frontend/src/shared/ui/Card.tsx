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

export function Card({ padding = 'md', className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-[var(--bg-elevated)] border border-[var(--border)]',
        'shadow-[var(--shadow-card)]',
        paddingStyles[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
