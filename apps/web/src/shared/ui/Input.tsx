import { type InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  errorClassName?: string;
  label?: string;
  labelClassName?: string;
  error?: string;
}

/**
 * Text input with floating label and error state.
 *
 * Uses `forwardRef` so parent forms can focus or scroll to the input
 * programmatically (e.g. react-hook-form's register()).
 *
 * Accessibility:
 * - Auto-generates an `id` from the label text when none is provided,
 *   wiring up the <label htmlFor> association automatically.
 * - Sets `aria-invalid` and `aria-describedby` when an error is present,
 *   so screen readers announce the error context.
 * - Error text uses `role="alert"` for live-region announcement.
 *
 * Style: hard edges, visible borders, uppercase utilitarian labels —
 * consistent with docs/design-docs/visual-style.md input spec.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, errorClassName, id, labelClassName, ...props }, ref) => {
    // Derive a stable id from the label so htmlFor works without explicit id.
    // Falls back to the caller-provided id if present.
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              'text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-secondary)]',
              labelClassName,
            )}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm',
            'placeholder:text-[var(--text-muted)]',
            'focus:outline-none focus:border-[var(--border-strong)] focus:ring-1 focus:ring-[var(--border-strong)]',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'transition-colors duration-200',
            // Strengthen the border on error to make it visually distinct
            error && 'border-[var(--border-strong)] focus:border-[var(--border-strong)]',
            !props.value && !props.defaultValue && 'text-[var(--text-primary)]',
            className,
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className={clsx(
              'text-[11px] uppercase tracking-[0.18em] text-[var(--text-primary)]',
              errorClassName,
            )}
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
