import { clsx } from 'clsx';
import { CATEGORY_LABELS, type Category } from '../types';

interface CategoryFilterProps {
  selectedCategory: Category | undefined;
  onCategoryChange: (category: Category | undefined) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const categories: Category[] = ['tops', 'bottoms', 'dresses', 'shoes', 'accessories', 'outerwear'];

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      <button
        onClick={() => onCategoryChange(undefined)}
        className={clsx(
          'px-4 py-2 text-sm rounded-full border whitespace-nowrap transition-colors',
          !selectedCategory
            ? 'bg-[var(--text-primary)] text-[var(--bg)] border-[var(--text-primary)]'
            : 'bg-transparent text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--text-secondary)]'
        )}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={clsx(
            'px-4 py-2 text-sm rounded-full border whitespace-nowrap transition-colors',
            selectedCategory === category
              ? 'bg-[var(--text-primary)] text-[var(--bg)] border-[var(--text-primary)]'
              : 'bg-transparent text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--text-secondary)]'
          )}
        >
          {CATEGORY_LABELS[category]}
        </button>
      ))}
    </div>
  );
}
