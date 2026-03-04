import { useEffect, useState } from 'react';
import { useWardrobeStore } from '../store';
import { CATEGORY_LABELS, type Category, type WardrobeItem, type Season } from '../types';
import { Button } from '@/shared/ui/Button';
import { WardrobeGrid } from '../components/WardrobeGrid';
import { CategoryFilter } from '../components/CategoryFilter';
import { SeasonFilter } from '../components/SeasonFilter';
import { ColorFilter } from '../components/ColorFilter';
import { UploadModal } from '../components/UploadModal';
import { EditItemModal } from '../components/EditItemModal';

export function WardrobePage() {
  const { items, isLoading, error, filters, fetchItems, setFilters, clearError } = useWardrobeStore();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showColorFilter, setShowColorFilter] = useState(false);
  const [showSeasonFilter, setShowSeasonFilter] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCategoryChange = (category: Category | undefined) => {
    setFilters({ ...filters, category });
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery || undefined });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const hasActiveFilters = filters.search || filters.colors?.length || filters.seasons?.length || filters.category;

  return (
    <div className="min-h-screen bg-[var(--bg)] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-4">
          <h1
            className="text-4xl text-[var(--text-primary)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            My Wardrobe
          </h1>
          <Button onClick={() => setIsUploadModalOpen(true)}>
            + Add Item
          </Button>
        </div>
        <div className="border-t border-[var(--border-strong)] mb-8" />

        {error && (
          <div className="mb-4 p-3 bg-[var(--error)] bg-opacity-10 border border-[var(--error)] rounded text-sm text-[var(--error)]">
            {error}
            <button onClick={clearError} className="ml-2 underline">
              Dismiss
            </button>
          </div>
        )}

        <div className="flex gap-3 mb-4">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Search by name or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>
          <Button 
            variant={showColorFilter ? 'primary' : 'ghost'} 
            onClick={() => setShowColorFilter(!showColorFilter)}
          >
            Colors
          </Button>
          <Button 
            variant={showSeasonFilter ? 'primary' : 'ghost'} 
            onClick={() => setShowSeasonFilter(!showSeasonFilter)}
          >
            Seasons
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={handleClearFilters}>
              Clear All
            </Button>
          )}
        </div>

        {showColorFilter && (
          <div className="mb-4 p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border)]">
            <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Filter by colors</p>
            <ColorFilter 
              selectedColors={filters.colors || []} 
              onColorChange={handleColorChange}
            />
          </div>
        )}

        {showSeasonFilter && (
          <div className="mb-4 p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border)]">
            <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Filter by seasons</p>
            <SeasonFilter 
              selectedSeasons={filters.seasons || []} 
              onSeasonChange={handleSeasonChange}
            />
          </div>
        )}

        <CategoryFilter
          selectedCategory={filters.category}
          onCategoryChange={handleCategoryChange}
        />

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-sm text-[var(--text-secondary)]">Loading your wardrobe...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              {hasActiveFilters
                ? 'No items match your filters'
                : filters.category
                  ? `No ${CATEGORY_LABELS[filters.category].toLowerCase()} in your wardrobe yet.`
                  : 'Your wardrobe is empty. Start by adding some items!'}
            </p>
            <Button onClick={() => setIsUploadModalOpen(true)}>
              Add Your First Item
            </Button>
          </div>
        ) : (
          <WardrobeGrid items={items} onItemClick={setEditingItem} />
        )}
      </div>

      <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
      <EditItemModal
        isOpen={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
      />
    </div>
  );
}
