import { Trash2 } from 'lucide-react';
import type { KeyboardEvent, MouseEvent } from 'react';
import type { Outfit } from '../types';
import { getGeneratedImageUrl } from '../api';

/**
 * Card for a saved outfit in the wardrobe panel's "Saved" tab.
 * Shows the outfit thumbnail (from the `generated` bucket), item count,
 * and last-updated date. Supports click-to-load and hover-reveal delete.
 * The delete button uses `confirm()` as a simple guard against accidental deletion.
 */
interface OutfitCardProps {
  outfit: Outfit;
  onDelete: (outfitId: string) => void;
  onSelect: (outfit: Outfit) => void;
}

export function OutfitCard({ outfit, onDelete, onSelect }: OutfitCardProps) {
  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this outfit?')) {
      onDelete(outfit.id);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(outfit);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(outfit)}
      onKeyDown={handleKeyDown}
      className="group relative flex w-full flex-col bg-transparent p-2 text-left transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
    >
      <button
        type="button"
        onClick={handleDelete}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-[color:rgba(244,244,239,0.88)] text-[var(--text-primary)] opacity-0 transition-all group-hover:opacity-100 hover:bg-[var(--surface-inverse)] hover:text-[var(--text-inverse)] focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
        aria-label={`Delete ${outfit.name || 'untitled outfit'}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="flex aspect-[0.95] items-center justify-center bg-[color:rgba(244,244,239,0.32)] p-4">
        {outfit.thumbnail_path ? (
          <img
            src={getGeneratedImageUrl(outfit.thumbnail_path)}
            alt={outfit.name || 'Outfit'}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">
            No preview
          </span>
        )}
      </div>

      <div className="mt-3 space-y-1 opacity-92">
        <h3 className="truncate text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
          {outfit.name || 'Untitled outfit'}
        </h3>
        <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
          <span>{outfit.item_ids.length} items</span>
          <span>{new Date(outfit.updated_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
