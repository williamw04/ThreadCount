import type { OutfitItem } from '../../types';
import { getItemImageUrl } from '../../api';

/**
 * Grid of accessories for the replace conflict modal.
 * Displays items from a single accessory rail so the user can
 * choose which existing accessory to evict for the new one.
 */
interface AccessoryReplaceGridProps {
  items: OutfitItem[];
  onReplace: (index: number) => void;
}

export function AccessoryReplaceGrid({ items, onReplace }: AccessoryReplaceGridProps) {
  return (
    <div className="grid gap-3 grid-cols-2">
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onReplace(index)}
          className="border border-[var(--border)] bg-[var(--bg)] p-4 text-left transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
        >
          <div className="flex h-24 items-center justify-center border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
            {item.image_path ? (
              <img
                src={getItemImageUrl(item.image_path) || ''}
                alt={item.name}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                No image
              </span>
            )}
          </div>
          <p className="mt-3 truncate text-sm uppercase tracking-[0.08em] text-[var(--text-primary)]">
            {item.name}
          </p>
        </button>
      ))}
    </div>
  );
}
