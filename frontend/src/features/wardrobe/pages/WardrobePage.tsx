/* eslint-disable max-lines -- ponytail: pre-existing 375 lines, split when next touched */
import { type KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { useWardrobeStore } from '../store';
import { CATEGORY_LABELS, type Category, type WardrobeItem, type Season } from '../types';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { PageIntro } from '@/shared/ui/PageIntro';
import { SurfaceMessage } from '@/shared/ui/SurfaceMessage';
import { WardrobeGrid } from '../components/WardrobeGrid';
import { CategoryFilter } from '../components/CategoryFilter';
import { SeasonFilter } from '../components/SeasonFilter';
import { ColorFilter } from '../components/ColorFilter';
import { UploadModal } from '../components/UploadModal';
import { UploadOutfitModal } from '../components/UploadOutfitModal';
import { EditItemModal } from '../components/EditItemModal';
import { EditOutfitModal } from '../components/EditOutfitModal';
import { supabase } from '@/shared/api/supabase';
import { useAuthStore } from '@/features/auth/store';

/**
 * Wardrobe page — the primary browse/manage surface for clothing items.
 *
 * This page aggregates two data sources that use different access patterns:
 * - **Wardrobe items**: fetched via the REST API through the wardrobe store
 *   (server-side filtering, Zod-validated responses).
 * - **Uploaded outfits**: queried directly against the Supabase `outfits` table
 *   where `item_ids = '{}'` (an empty array signals an uploaded photo rather
 *   than a composed outfit). This bypasses the API layer because the outfit
 *   endpoints don't expose a filter for uploaded-only records.
 *
 * See docs/features/virtual-wardrobe/product-spec.md for acceptance criteria.
 */
interface UploadedOutfit {
  id: string;
  name: string | null;
  item_ids: string[];
  thumbnail_path: string | null;
  created_at: string;
}

function WardrobeMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
      <p className="eyebrow text-[var(--text-muted)]">{label}</p>
      <p className="mt-4 text-4xl font-semibold uppercase leading-none tracking-[0.08em] text-[var(--text-primary)]">
        {value}
      </p>
    </div>
  );
}

export function WardrobePage() {
  const { items, isLoading, error, filters, fetchItems, setFilters, clearError } =
    useWardrobeStore();
  const { user } = useAuthStore();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploadOutfitModalOpen, setIsUploadOutfitModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null);
  const [editingOutfit, setEditingOutfit] = useState<UploadedOutfit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showColorFilter, setShowColorFilter] = useState(false);
  const [showSeasonFilter, setShowSeasonFilter] = useState(false);
  const [uploadedOutfits, setUploadedOutfits] = useState<UploadedOutfit[]>([]);
  const [isLoadingOutfits, setIsLoadingOutfits] = useState(true);

  /**
   * Fetches user-uploaded outfit photos directly from Supabase.
   * Filters for `item_ids = '{}'` to distinguish uploaded photos from
   * composed outfits (which have populated `item_ids` arrays).
   * Results are ordered by most recent first. Only the first load shows the
   * spinner; refetches after upload or edit swap the list in place.
   */
  const fetchUploadedOutfits = useCallback(() => {
    if (!user) return;
    const query = supabase
      .from('outfits')
      .select('*')
      .eq('user_id', user.id)
      .eq('item_ids', '{}')
      .order('created_at', { ascending: false });
    Promise.resolve(query)
      .then(({ data, error: err }) => {
        if (err) throw err;
        setUploadedOutfits(data || []);
      })
      .catch((err: unknown) => console.error('Failed to fetch uploaded outfits:', err))
      .finally(() => setIsLoadingOutfits(false));
  }, [user]);

  useEffect(() => {
    fetchItems();
    fetchUploadedOutfits();
  }, [fetchItems, fetchUploadedOutfits]);

  const handleCategoryChange = (category: Category | undefined) => {
    setFilters({ ...filters, category });
  };

  const handleSearch = () => {
    const normalizedQuery = searchQuery.trim();
    setFilters({ ...filters, search: normalizedQuery || undefined });
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSeasonChange = (seasons: Season[]) => {
    setFilters({ ...filters, seasons: seasons.length > 0 ? seasons : undefined });
  };

  const handleColorChange = (colors: string[]) => {
    setFilters({ ...filters, colors: colors.length > 0 ? colors : undefined });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({});
    setShowColorFilter(false);
    setShowSeasonFilter(false);
  };

  const hasActiveFilters =
    filters.search || filters.colors?.length || filters.seasons?.length || filters.category;
  const activeFilterCount = [
    filters.search ? 1 : 0,
    filters.colors?.length ? 1 : 0,
    filters.seasons?.length ? 1 : 0,
    filters.category ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  return (
    <div className="page-enter min-h-screen bg-[var(--bg)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <PageIntro
            className="flex-1"
            description="Refine your wardrobe with clean filters, sharp metadata, and a stricter monochrome wardrobe presentation."
            eyebrow="Wardrobe"
            title="My Wardrobe"
          />
          <div className="flex gap-3 self-start xl:mb-6">
            <Button onClick={() => setIsUploadOutfitModalOpen(true)} size="lg" variant="secondary">
              Add Outfit
            </Button>
            <Button onClick={() => setIsUploadModalOpen(true)} size="lg">
              Add Item
            </Button>
          </div>
        </div>

        {error && (
          <div
            className="flex flex-col gap-3 border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-primary)] sm:flex-row sm:items-center sm:justify-between"
            role="alert"
          >
            <p>{error}</p>
            <Button
              className="self-start sm:self-auto"
              onClick={clearError}
              size="sm"
              variant="secondary"
            >
              Dismiss
            </Button>
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.8fr)]">
          <Card className="border-[var(--border-strong)]" padding="sm">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <Input
                className="border-[var(--border-strong)] bg-[var(--bg)]"
                id="wardrobe-search"
                label="Search wardrobe"
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Name, label, or detail"
                value={searchQuery}
              />
              <Button className="w-full lg:w-auto" onClick={handleSearch} size="md">
                Search
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-5">
              <Button
                aria-expanded={showColorFilter}
                onClick={() => setShowColorFilter(!showColorFilter)}
                size="sm"
                variant={showColorFilter ? 'primary' : 'secondary'}
              >
                Colors
              </Button>
              <Button
                aria-expanded={showSeasonFilter}
                onClick={() => setShowSeasonFilter(!showSeasonFilter)}
                size="sm"
                variant={showSeasonFilter ? 'primary' : 'secondary'}
              >
                Seasons
              </Button>
              {hasActiveFilters && (
                <Button onClick={handleClearFilters} size="sm" variant="ghost">
                  Clear all
                </Button>
              )}
              <p className="ml-auto text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {activeFilterCount === 0
                  ? 'No active filters'
                  : `${activeFilterCount} filter${activeFilterCount === 1 ? '' : 's'} active`}
              </p>
            </div>

            {(showColorFilter || showSeasonFilter) && (
              <div className="mt-5 grid gap-4 border-t border-[var(--border)] pt-5 lg:grid-cols-2">
                {showColorFilter && (
                  <div className="space-y-3 border border-[var(--border)] bg-[var(--bg)] p-4">
                    <p className="eyebrow text-[var(--text-muted)]">Color edit</p>
                    <ColorFilter
                      onColorChange={handleColorChange}
                      selectedColors={filters.colors || []}
                    />
                  </div>
                )}
                {showSeasonFilter && (
                  <div className="space-y-3 border border-[var(--border)] bg-[var(--bg)] p-4">
                    <p className="eyebrow text-[var(--text-muted)]">Season edit</p>
                    <SeasonFilter
                      onSeasonChange={handleSeasonChange}
                      selectedSeasons={filters.seasons || []}
                    />
                  </div>
                )}
              </div>
            )}
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <WardrobeMetric label="Visible items" value={String(items.length).padStart(2, '0')} />
            <WardrobeMetric
              label="Current focus"
              value={filters.category ? CATEGORY_LABELS[filters.category] : 'All'}
            />
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-[var(--text-muted)]">Category index</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Move between wardrobe groups without leaving the wardrobe.
              </p>
            </div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {filters.search ? `Search: ${filters.search}` : 'Showing full collection'}
            </p>
          </div>

          <CategoryFilter
            selectedCategory={filters.category}
            onCategoryChange={handleCategoryChange}
          />
        </section>

        {isLoading ? (
          <SurfaceMessage
            description="Pulling your wardrobe records into the wardrobe."
            kicker="Loading"
            title="Preparing inventory"
          />
        ) : items.length === 0 ? (
          <SurfaceMessage
            description={
              hasActiveFilters
                ? 'No items match the current filter set. Clear a filter or widen the search.'
                : filters.category
                  ? `No ${CATEGORY_LABELS[filters.category].toLowerCase()} are stored in this category yet.`
                  : 'Your wardrobe is empty. Start the collection with a first upload.'
            }
            kicker={hasActiveFilters ? 'No match' : 'Empty wardrobe'}
            title={hasActiveFilters ? 'Adjust the edit' : 'Add your first item'}
          />
        ) : (
          <WardrobeGrid items={items} onItemClick={setEditingItem} />
        )}

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-[var(--text-muted)]">Complete looks</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Uploaded outfit photos stored directly in your archive.
              </p>
            </div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {uploadedOutfits.length} outfit{uploadedOutfits.length === 1 ? '' : 's'}
            </p>
          </div>

          {isLoadingOutfits ? (
            <SurfaceMessage
              description="Syncing your uploaded outfits."
              kicker="Loading"
              title="Fetching looks"
            />
          ) : uploadedOutfits.length === 0 ? (
            <SurfaceMessage
              description="Upload complete outfit photos to see them here."
              kicker="No uploads"
              title="No uploaded outfits"
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {uploadedOutfits.map((outfit) => (
                <div
                  key={outfit.id}
                  className="group flex flex-col bg-transparent p-2 text-left transition-opacity hover:opacity-100 cursor-pointer"
                  onClick={() => setEditingOutfit(outfit)}
                >
                  <div className="flex aspect-[0.8] items-center justify-center bg-[color:rgba(244,244,239,0.32)] p-3">
                    {outfit.thumbnail_path ? (
                      <img
                        alt={outfit.name || 'Outfit'}
                        className="max-h-full max-w-full object-contain"
                        src={
                          supabase.storage.from('generated').getPublicUrl(outfit.thumbnail_path)
                            .data.publicUrl
                        }
                      />
                    ) : (
                      <span className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">
                        No image
                      </span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="truncate text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
                      {outfit.name || 'Untitled outfit'}
                    </p>
                    <p className="text-[9px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      {new Date(outfit.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
      {/* Mounted only while open so their form state resets on close without effects. */}
      {isUploadOutfitModalOpen && (
        <UploadOutfitModal
          isOpen
          onClose={() => setIsUploadOutfitModalOpen(false)}
          onUploadSuccess={fetchUploadedOutfits}
        />
      )}
      <EditItemModal
        isOpen={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
      />
      {editingOutfit && (
        <EditOutfitModal
          key={editingOutfit.id}
          isOpen
          outfit={editingOutfit}
          onClose={() => setEditingOutfit(null)}
          onUpdateSuccess={fetchUploadedOutfits}
        />
      )}
    </div>
  );
}
