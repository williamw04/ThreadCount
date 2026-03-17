import { type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'border border-[var(--border-strong)] bg-[var(--surface-inverse)] text-[var(--text-inverse)] hover:opacity-80',
  secondary:
    'border border-[var(--border-strong)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-inverse)] hover:text-[var(--text-inverse)]',
  ghost:
    'border border-transparent bg-transparent text-[var(--text-secondary)] hover:border-[var(--border)] hover:text-[var(--text-primary)]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-3 py-2 text-[11px] tracking-[0.22em]',
  md: 'min-h-11 px-5 py-3 text-[11px] tracking-[0.24em]',
  lg: 'min-h-12 px-7 py-3.5 text-[11px] tracking-[0.28em]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium uppercase transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
