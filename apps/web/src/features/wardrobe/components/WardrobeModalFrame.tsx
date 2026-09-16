import { type ReactNode, useEffect, useId } from 'react';
import { clsx } from 'clsx';

/**
 * Shared modal frame for all wardrobe modals (upload, edit, upload outfit).
 *
 * Provides consistent layout, keyboard handling (Escape to close),
 * backdrop click-to-dismiss, and ARIA attributes. The `title` and `description`
 * props are wired to `aria-labelledby` and `aria-describedby` respectively.
 * Content is scrollable when it exceeds 92vh.
 */
interface WardrobeModalFrameProps {
  children: ReactNode;
  className?: string;
  description?: string;
  onClose: () => void;
  title: string;
}

export function WardrobeModalFrame({
  children,
  className,
  description,
  onClose,
  title,
}: WardrobeModalFrameProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 px-4 py-6 sm:px-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={clsx(
          'mx-auto flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden border border-[var(--border-strong)] bg-[var(--bg)] shadow-[var(--shadow-floating)]',
          className,
        )}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-5 sm:px-8">
          <div className="space-y-2">
            <p className="eyebrow text-[var(--text-muted)]">Wardrobe item</p>
            <div className="space-y-1">
              <h2
                className="text-2xl font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)] sm:text-3xl"
                id={titleId}
              >
                {title}
              </h2>
              {description ? (
                <p
                  className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)]"
                  id={descriptionId}
                >
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          <button
            aria-label="Close modal"
            className="flex h-11 w-11 items-center justify-center border border-[var(--border-strong)] bg-[var(--bg-elevated)] text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-inverse)] hover:text-[var(--text-inverse)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
            onClick={onClose}
            type="button"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-8 sm:py-7">{children}</div>
      </div>
    </div>
  );
}
