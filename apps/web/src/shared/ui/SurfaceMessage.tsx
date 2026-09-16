import { clsx } from 'clsx';

interface SurfaceMessageProps {
  className?: string;
  kicker?: string;
  title: string;
  description?: string;
}

/**
 * Centered empty-state or status message displayed inside a bordered panel.
 *
 * Used for empty wardrobes, loading states, and informational callouts.
 * Follows the "framed object" card aesthetic from visual-style.md —
 * a single border with elevated background and no decorative elements.
 * The optional "kicker" uses the eyebrow typography class for a compact
 * uppercase label above the main heading.
 */
export function SurfaceMessage({ className, kicker, title, description }: SurfaceMessageProps) {
  return (
    <div
      className={clsx(
        'border border-[var(--border)] bg-[var(--bg-elevated)] px-6 py-8 text-center',
        className,
      )}
    >
      {kicker ? <p className="eyebrow text-[var(--text-muted)]">{kicker}</p> : null}
      <h2 className="mt-3 text-2xl font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
