import { type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

// Variant styles follow the visual-style.md spec:
// - primary: filled dark button for dominant actions
// - secondary: outlined with strong border, fills on hover
// - ghost: minimal, transparent until hovered
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'border border-[var(--border-strong)] bg-[var(--text-primary)] text-[var(--text-inverse)] hover:opacity-80 active:opacity-60',
  secondary:
    'border border-[var(--border)] bg-transparent hover:border-[var(--border-strong)] hover:bg-[var(--text-primary)] hover:text-[var(--text-inverse)] active:bg-[var(--text-primary)] active:text-[var(--text-inverse)]',
  ghost:
    'border border-transparent bg-transparent text-[var(--text-secondary)] hover:border-[var(--border)] hover:text-[var(--text-primary)] active:border-[var(--border)] active:text-[var(--text-primary)]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-3 py-2 text-[11px] tracking-[0.22em]',
  md: 'min-h-11 px-5 py-3 text-[11px] tracking-[0.24em]',
  lg: 'min-h-12 px-7 py-3.5 text-[11px] tracking-[0.28em]',
};

/**
 * Shared button component for the Seamless design system.
 *
 * Variants map to the three action tiers defined in docs/design-docs/visual-style.md:
 * primary (dominant), secondary (outlined), ghost (minimal). All sizes use
 * 11px uppercase type with tight tracking — the utilitarian label style from
 * the style guide. Square corners are enforced via the absence of rounded-* classes.
 */
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
        // Focus ring uses the --focus token for visible keyboard navigation
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
