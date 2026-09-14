import { clsx } from 'clsx';

interface WardrobeBadgeListProps {
  className?: string;
  label: string;
  values: string[];
}

export function WardrobeBadgeList({ className, label, values }: WardrobeBadgeListProps) {
  if (values.length === 0) {
    return null;
  }

  return (
    <div className={clsx('space-y-3', className)}>
      <p className="eyebrow text-[var(--text-muted)]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            key={`${label}-${value}`}
            className="border border-[var(--border)] bg-[var(--bg-muted)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[var(--text-secondary)]"
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}
