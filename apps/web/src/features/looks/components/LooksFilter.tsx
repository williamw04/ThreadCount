import type { LookFilter, Look } from '../types';
import { LOOK_FILTERS } from '../types';

/**
 * Sticky filter bar for the looks page.
 * Shows three tabs (All, Saved Outfits, Renders) with count badges.
 * Filter changes are client-side — no API refetch occurs.
 * Counts are derived from the full `looks` array passed as a prop.
 */

interface LooksFilterProps {
  filter: LookFilter;
  onFilterChange: (filter: LookFilter) => void;
  looks: Look[];
}

export function LooksFilter({ filter, onFilterChange, looks }: LooksFilterProps) {
  const getCount = (filterValue: LookFilter): number => {
    if (filterValue === 'all') return looks.length;
    return looks.filter((look) => look.type === filterValue).length;
  };

  return (
    <div className="flex gap-2 p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
      {LOOK_FILTERS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onFilterChange(value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === value
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {label}
          <span className="ml-2 text-xs opacity-70">({getCount(value)})</span>
        </button>
      ))}
    </div>
  );
}
