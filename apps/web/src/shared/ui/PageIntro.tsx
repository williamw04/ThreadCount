import { clsx } from 'clsx';

interface PageIntroProps {
  className?: string;
  description: string;
  eyebrow: string;
  title: string;
}

/**
 * Standard page header block used across all feature pages.
 *
 * Follows the "editorial contrast" principle from visual-style.md:
 * oversized headings (4xl–6xl) paired with a compact uppercase "eyebrow"
 * label and secondary description text. The `luxury-rule` horizontal
 * divider at the bottom creates the "stacked sections separated by strong
 * horizontal rules" layout pattern described in the style guide.
 */
export function PageIntro({ className, description, eyebrow, title }: PageIntroProps) {
  return (
    <header className={clsx('space-y-5', className)}>
      <p className="eyebrow text-[var(--text-muted)]">{eyebrow}</p>
      <div className="max-w-4xl space-y-4">
        <h1 className="max-w-3xl text-4xl font-semibold uppercase leading-none tracking-[0.08em] text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
          {description}
        </p>
      </div>
      <hr className="luxury-rule" />
    </header>
  );
}
