import { useEffect, useState, useMemo } from 'react';
import { useLooksStore } from '../store';
import type { Look } from '../types';
import { PageIntro } from '@/shared/ui/PageIntro';
import { LooksFilter, LooksGrid, LookDetailModal } from '../components';

/**
 * Previous Looks page — Pinterest-style gallery of saved outfits and AI renders.
 *
 * Aggregates two data sources (outfits + generated images) via the looks store,
 * which fetches both in parallel and normalizes them into a unified Look[] array.
 * Filtering is client-side via `useMemo` — the full dataset is already loaded.
 *
 * Shows metrics (saved count, render count, total) in the page intro,
 * a sticky filter bar, and a masonry grid of look cards.
 *
 * See docs/features/previous-looks/product-spec.md for acceptance criteria.
 */
export function LooksPage() {
  const { looks, filter, isLoading, error, fetchLooks, setFilter, deleteLook, clearError } =
    useLooksStore();
  const [selectedLook, setSelectedLook] = useState<Look | null>(null);

  useEffect(() => {
    fetchLooks();
  }, [fetchLooks]);

  const filteredLooks = useMemo(() => {
    if (filter === 'all') return looks;
    return looks.filter((look) => look.type === filter);
  }, [looks, filter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageIntro
        eyebrow="Your Gallery"
        title="Previous Looks"
        description="Browse your saved outfits and AI-generated renders"
      />

      {error && (
        <div className="mx-4 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={clearError} className="text-red-600 text-sm underline mt-1">
            Dismiss
          </button>
        </div>
      )}

      <LooksFilter filter={filter} onFilterChange={setFilter} looks={looks} />

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : (
        <LooksGrid looks={filteredLooks} onLookClick={setSelectedLook} />
      )}

      {selectedLook && (
        <LookDetailModal
          look={selectedLook}
          onClose={() => setSelectedLook(null)}
          onDelete={deleteLook}
        />
      )}
    </div>
  );
}
