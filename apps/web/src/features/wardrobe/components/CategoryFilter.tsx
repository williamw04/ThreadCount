import { clsx } from 'clsx';
import { CATEGORY_LABELS, type Category } from '../types';

/**
 * Horizontal category filter bar for the wardrobe page.
 * Selection is mutually exclusive — choosing a category deselects the previous one.
 * Changes propagate to the store's `setFilters`, which triggers a server-side refetch.
 * An "All" button clears the category filter while preserving any active search/color/season filters.
 */

interface CategoryFilterProps {
  selectedCategory: Category | undefined;
  onCategoryChange: (category: Category | undefined) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const categories: Category[] = [
    'tops',
    'bottoms',
    'dresses',
    'shoes',
    'accessories',
    'outerwear',
  ];

  return (
    <div
      aria-label="Filter wardrobe by category"
      className="flex gap-2 overflow-x-auto border-y border-[var(--border)] py-4"
      role="toolbar"
    >
      <button
        onClick={() => onCategoryChange(undefined)}
        type="button"
        aria-pressed={!selectedCategory}
        className={clsx(
          'border px-4 py-3 text-[11px] font-medium uppercase tracking-[0.2em] whitespace-nowrap transition-colors',
          !selectedCategory
            ? 'border-[var(--border-strong)] bg-[var(--text-primary)] !text-[var(--text-inverse)]'
            : 'border-[var(--border)] bg-transparent !text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-muted)] active:border-[var(--border-strong)] active:bg-[var(--text-primary)] active:!text-[var(--text-inverse)]',
        )}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          type="button"
          aria-pressed={selectedCategory === category}
          className={clsx(
            'border px-4 py-3 text-[11px] font-medium uppercase tracking-[0.2em] whitespace-nowrap transition-colors',
            selectedCategory === category
              ? 'border-[var(--border-strong)] bg-[var(--text-primary)] !text-[var(--text-inverse)]'
              : 'border-[var(--border)] bg-transparent !text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-muted)] active:border-[var(--border-strong)] active:bg-[var(--text-primary)] active:!text-[var(--text-inverse)]',
          )}
        >
          {CATEGORY_LABELS[category]}
        </button>
      ))}
    </div>
  );
}
