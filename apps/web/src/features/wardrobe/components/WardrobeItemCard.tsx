import type { WardrobeItem } from '../types';
import { getItemImageUrl } from '../api';
import { CATEGORY_LABELS } from '../types';

interface WardrobeItemCardProps {
  item: WardrobeItem;
  onClick?: () => void;
}

export function WardrobeItemCard({ item, onClick }: WardrobeItemCardProps) {
  const imageUrl = getItemImageUrl(item.image_path);
  // Show the first AI-detected color and season as compact metadata badges.
  // These are read-only — users cannot manually override AI-detected values.
  const metadata = [item.colors?.[0], item.seasons?.[0]].filter(Boolean);

  return (
    <div className="h-full" role="listitem">
      <button
        aria-label={`Edit ${item.name}`}
        className="group flex h-full w-full flex-col border border-[var(--border)] bg-[var(--bg-elevated)] text-left shadow-[var(--shadow-panel)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
        disabled={!onClick}
        onClick={onClick}
        type="button"
      >
        <div className="relative border-b border-[var(--border)] bg-[var(--bg-muted)]">
          {item.is_template ? (
            <div className="absolute left-0 top-0 z-10 border-r border-b border-[var(--border-strong)] bg-[var(--surface-inverse)] px-3 py-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--text-inverse)]">
              Sample
            </div>
          ) : null}
          {imageUrl ? (
            <div className="aspect-square overflow-hidden">
              <img
                alt={item.name}
                className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
                src={imageUrl}
              />
            </div>
          ) : (
            <div className="flex aspect-square flex-col items-center justify-center gap-3 p-6 text-center">
              <svg
                className="h-12 w-12 text-[var(--text-muted)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                />
              </svg>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Image unavailable
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="space-y-2">
            <p className="eyebrow text-[var(--text-muted)]">{CATEGORY_LABELS[item.category]}</p>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold uppercase leading-5 tracking-[0.05em] text-[var(--text-primary)]">
                {item.name}
              </h3>
              <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Edit
              </span>
            </div>
          </div>
          <div className="mt-auto flex flex-wrap gap-2 border-t border-[var(--border)] pt-3">
            {metadata.length > 0 ? (
              metadata.map((value) => (
                <span
                  key={value}
                  className="border border-[var(--border)] bg-[var(--bg-muted)] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--text-secondary)]"
                >
                  {value}
                </span>
              ))
            ) : (
              <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Catalog entry
              </span>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
