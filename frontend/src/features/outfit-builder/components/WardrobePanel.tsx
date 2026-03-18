import { useMemo, useState } from 'react';
import { ArrowLeft, Check, RefreshCcw, Sparkles } from 'lucide-react';
import { useOutfitBuilderStore } from '../store';
import { MAIN_CATEGORY_LABELS, type Outfit, type OutfitItem } from '../types';
import { getItemImageUrl } from '../api';
import { useWardrobeStore } from '@/features/wardrobe/store';
import { OutfitCard } from './OutfitCard';
import { Button } from '@/shared/ui/Button';
import { SurfaceMessage } from '@/shared/ui/SurfaceMessage';
import {
  CATEGORY_TO_SLOT,
  MAIN_CATEGORIES,
  MAIN_TO_CATEGORY,
  SLOT_TO_MAIN,
  SUB_CATEGORIES,
  SUB_TO_CATEGORY,
  type MainCategory,
} from './panel/panelConfig';
import { ReplaceModal } from './panel/ReplaceModal';
import type { Category } from '@/features/wardrobe/types';

type RailTab = MainCategory | 'saved';
type NavLevel = 'root' | 'garments';

interface WardrobePanelProps {
  isBootstrapping: boolean;
  isRefreshDisabled: boolean;
  onDeleteSavedLook: (outfitId: string) => void;
  onLoadSavedLook: (outfit: Outfit) => void;
  onRefreshSavedLooks: () => void;
  outfits: Outfit[];
  saveState: 'idle' | 'saved';
}

export function WardrobePanel({
  isBootstrapping,
  isRefreshDisabled,
  onDeleteSavedLook,
  onLoadSavedLook,
  onRefreshSavedLooks,
  outfits,
  saveState,
}: WardrobePanelProps) {
  const { addToSlot, canvas, removeFromSlot, selectedSlot } = useOutfitBuilderStore();
  const { items: wardrobeItems, isLoading } = useWardrobeStore();
  const [navLevel, setNavLevel] = useState<NavLevel>('root');
  const [selectedTab, setSelectedTab] = useState<RailTab | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [pendingItem, setPendingItem] = useState<OutfitItem | null>(null);

  const slotTab = selectedSlot ? SLOT_TO_MAIN[selectedSlot] : null;
  const activeTab = slotTab ?? selectedTab;
  const effectiveMain = activeTab && activeTab !== 'saved' ? activeTab : null;
  const activeSelectedSub = selectedSlot ? null : selectedSub;
  const subCategories = effectiveMain ? SUB_CATEGORIES[effectiveMain] : [];

  const filteredItems = useMemo(() => {
    if (!effectiveMain) {
      return wardrobeItems;
    }

    if (activeSelectedSub) {
      const categories = SUB_TO_CATEGORY[activeSelectedSub] || [];
      return wardrobeItems.filter((item) => categories.includes(item.category));
    }

    const categories = MAIN_TO_CATEGORY[effectiveMain];
    return wardrobeItems.filter((item) => categories.includes(item.category));
  }, [activeSelectedSub, effectiveMain, wardrobeItems]);

  const handleSelectRootTab = (tab: 'garments' | 'saved') => {
    if (tab === 'saved') {
      setSelectedTab('saved');
      setNavLevel('root');
    } else {
      setSelectedTab(null);
      setNavLevel('garments');
    }
    setSelectedSub(null);
  };

  const handleSelectCategory = (category: MainCategory) => {
    setSelectedTab(category);
    setSelectedSub(null);
  };

  const handleBackToRoot = () => {
    setNavLevel('root');
    setSelectedTab(null);
    setSelectedSub(null);
  };

  const getTopItemIndex = (itemId: string) => canvas.top.findIndex((item) => item.id === itemId);
  const getAccessoryLeftIndex = (itemId: string) =>
    canvas.accessoriesLeft.findIndex((item) => item.id === itemId);
  const getAccessoryRightIndex = (itemId: string) =>
    canvas.accessoriesRight.findIndex((item) => item.id === itemId);

  const handleSelectItem = (item: {
    id: string;
    name: string;
    category: Category;
    image_path: string | null;
  }) => {
    const outfitItem: OutfitItem = {
      id: item.id,
      name: item.name,
      category: item.category,
      image_path: item.image_path,
    };

    const slot = CATEGORY_TO_SLOT[item.category];

    if (slot === 'top') {
      const existingIndex = getTopItemIndex(item.id);
      if (existingIndex !== -1) {
        removeFromSlot('top', existingIndex);
        return;
      }
      if (canvas.top.length >= 2) {
        setPendingItem(outfitItem);
        return;
      }
      addToSlot('top', outfitItem);
      return;
    }

    if (slot === 'accessoriesLeft') {
      const existingLeft = getAccessoryLeftIndex(item.id);
      const existingRight = getAccessoryRightIndex(item.id);

      if (existingLeft !== -1) {
        removeFromSlot('accessoriesLeft', existingLeft);
        return;
      }
      if (existingRight !== -1) {
        removeFromSlot('accessoriesRight', existingRight);
        return;
      }

      if (canvas.accessoriesLeft.length + canvas.accessoriesRight.length >= 6) {
        setPendingItem(outfitItem);
        return;
      }

      if (canvas.accessoriesLeft.length <= canvas.accessoriesRight.length) {
        addToSlot('accessoriesLeft', outfitItem);
      } else {
        addToSlot('accessoriesRight', outfitItem);
      }
      return;
    }

    if (slot === 'bottom') {
      if (canvas.bottom?.id === item.id) {
        removeFromSlot('bottom');
        return;
      }
      if (canvas.bottom) {
        setPendingItem(outfitItem);
        return;
      }
      addToSlot('bottom', outfitItem);
      return;
    }

    if (slot === 'shoes') {
      if (canvas.shoes?.id === item.id) {
        removeFromSlot('shoes');
        return;
      }
      if (canvas.shoes) {
        setPendingItem(outfitItem);
        return;
      }
      addToSlot('shoes', outfitItem);
      return;
    }
  };

  const handleConfirmReplace = () => {
    if (!pendingItem) return;

    const slot = CATEGORY_TO_SLOT[pendingItem.category];
    removeFromSlot(slot);
    addToSlot(slot, pendingItem);
    setPendingItem(null);
  };

  const handleReplaceTop = (index: number) => {
    if (!pendingItem) return;
    removeFromSlot('top', index);
    addToSlot('top', pendingItem);
    setPendingItem(null);
  };

  const handleReplaceAccessory = (slot: 'accessoriesLeft' | 'accessoriesRight', index: number) => {
    if (!pendingItem) return;
    removeFromSlot(slot, index);
    addToSlot(slot, pendingItem);
    setPendingItem(null);
  };

  const isTopReplacement =
    pendingItem !== null &&
    canvas.top.length >= 2 &&
    CATEGORY_TO_SLOT[pendingItem.category] === 'top';
  const isAccessoryReplacement =
    pendingItem !== null && pendingItem.category === 'accessories' && !isTopReplacement;

  const isItemInCanvas = (itemId: string) => {
    return (
      canvas.top.some((item) => item.id === itemId) ||
      canvas.bottom?.id === itemId ||
      canvas.shoes?.id === itemId ||
      canvas.accessoriesLeft.some((item) => item.id === itemId) ||
      canvas.accessoriesRight.some((item) => item.id === itemId)
    );
  };

  return (
    <section className="flex h-full min-h-0 flex-col bg-transparent px-1">
      <div className="flex-none px-4 py-3">
        <p className="eyebrow text-[var(--text-muted)]">Wardrobe rail</p>
        <h2 className="mt-1 text-sm font-medium uppercase tracking-[0.1em] text-[var(--text-primary)]">
          Wardrobe
        </h2>
      </div>

      <div className="flex-none px-3 pb-3">
        <div className="relative overflow-hidden">
          <div
            className={[
              'flex transition-transform duration-300 ease-out',
              navLevel === 'root' ? '-translate-x-0' : '-translate-x-full',
            ].join(' ')}
          >
            <div className="flex w-full shrink-0 gap-2">
              <button
                type="button"
                onClick={() => handleSelectRootTab('garments')}
                className={[
                  'flex-1 px-3 py-2 text-left text-[11px] font-medium uppercase tracking-[0.22em] transition-colors',
                  navLevel === 'garments' || (activeTab && activeTab !== 'saved')
                    ? 'bg-[color:rgba(17,17,17,0.08)] text-[var(--text-primary)]'
                    : 'bg-[color:rgba(251,251,248,0.52)] text-[var(--text-secondary)] hover:bg-[color:rgba(17,17,17,0.06)] hover:text-[var(--text-primary)]',
                ].join(' ')}
              >
                Garments
              </button>
              <button
                type="button"
                onClick={() => handleSelectRootTab('saved')}
                className={[
                  'flex-1 px-3 py-2 text-left text-[11px] font-medium uppercase tracking-[0.22em] transition-colors',
                  activeTab === 'saved'
                    ? 'bg-[color:rgba(17,17,17,0.08)] text-[var(--text-primary)]'
                    : 'bg-[color:rgba(251,251,248,0.52)] text-[var(--text-secondary)] hover:bg-[color:rgba(17,17,17,0.06)] hover:text-[var(--text-primary)]',
                ].join(' ')}
              >
                Saved
              </button>
            </div>

            <div className="flex w-full shrink-0 gap-2">
              <button
                type="button"
                onClick={handleBackToRoot}
                className="flex items-center justify-center px-2 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              {MAIN_CATEGORIES.map((tab) => {
                const isActive = activeTab === tab;
                const label = MAIN_CATEGORY_LABELS[tab];

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => handleSelectCategory(tab)}
                    className={[
                      'flex-1 px-2 py-2 text-left text-[10px] font-medium uppercase tracking-[0.22em] transition-colors',
                      isActive
                        ? 'bg-[color:rgba(17,17,17,0.08)] text-[var(--text-primary)]'
                        : 'bg-[color:rgba(251,251,248,0.52)] text-[var(--text-secondary)] hover:bg-[color:rgba(17,17,17,0.06)] hover:text-[var(--text-primary)]',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {effectiveMain ? (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedSub(null)}
              className={[
                'px-3 py-2 text-[10px] font-medium uppercase tracking-[0.22em] whitespace-nowrap transition-colors',
                !activeSelectedSub
                  ? 'bg-[color:rgba(17,17,17,0.08)] text-[var(--text-primary)]'
                  : 'bg-[color:rgba(251,251,248,0.52)] text-[var(--text-secondary)] hover:bg-[color:rgba(17,17,17,0.06)] hover:text-[var(--text-primary)]',
              ].join(' ')}
            >
              All
            </button>
            {subCategories.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSub(sub)}
                className={[
                  'px-3 py-2 text-[10px] font-medium uppercase tracking-[0.22em] whitespace-nowrap transition-colors',
                  activeSelectedSub === sub
                    ? 'bg-[color:rgba(17,17,17,0.08)] text-[var(--text-primary)]'
                    : 'bg-[color:rgba(251,251,248,0.52)] text-[var(--text-secondary)] hover:bg-[color:rgba(17,17,17,0.06)] hover:text-[var(--text-primary)]',
                ].join(' ')}
              >
                {sub}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {activeTab === 'saved' ? (
          isBootstrapping ? (
            <SurfaceMessage
              className="h-full border-0 bg-transparent px-0 py-6 text-left shadow-none"
              description="Collecting saved compositions from the archive."
              kicker="Loading"
              title="Syncing saved looks"
            />
          ) : outfits.length === 0 ? (
            <SurfaceMessage
              className="h-full border-0 bg-transparent px-0 py-6 text-left shadow-none"
              description="The archive is empty. Save the current composition to build a reusable outfit catalog."
              kicker="No saved looks"
              title="Start the archive"
            />
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between gap-3">
                {saveState === 'saved' ? (
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[var(--text-primary)]">
                    <Check className="h-4 w-4" />
                    Saved
                  </div>
                ) : (
                  <div />
                )}
                <Button
                  disabled={isRefreshDisabled}
                  onClick={onRefreshSavedLooks}
                  size="sm"
                  variant="ghost"
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-4">
                {outfits.map((outfit) => (
                  <OutfitCard
                    key={outfit.id}
                    onDelete={onDeleteSavedLook}
                    onSelect={onLoadSavedLook}
                    outfit={outfit}
                  />
                ))}
              </div>
            </>
          )
        ) : isLoading ? (
          <SurfaceMessage
            className="h-full border-0 bg-transparent px-0 py-6 text-left shadow-none"
            description="Pulling wardrobe inventory into the selection rail."
            kicker="Loading"
            title="Preparing pieces"
          />
        ) : filteredItems.length === 0 ? (
          <SurfaceMessage
            className="h-full border-0 bg-transparent px-0 py-6 text-left shadow-none"
            description="No wardrobe items match this selection. Add inventory or switch to another category edit."
            kicker="Empty rail"
            title="No pieces available"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => {
              const imageUrl = getItemImageUrl(item.image_path);
              const inCanvas = isItemInCanvas(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectItem(item)}
                  className={[
                    'group flex flex-col bg-transparent p-2 text-left transition-opacity',
                    inCanvas ? 'opacity-100' : 'opacity-86 hover:opacity-100',
                  ].join(' ')}
                >
                  <div className="flex aspect-square items-center justify-center bg-[color:rgba(244,244,239,0.28)] p-4">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
                        No image
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
                        {item.category}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm uppercase tracking-[0.08em] text-[var(--text-primary)]">
                        {item.name}
                      </p>
                    </div>
                    {inCanvas ? (
                      <span className="inline-flex h-8 w-8 items-center justify-center bg-[var(--surface-inverse)] text-[var(--text-inverse)]">
                        <Check className="h-4 w-4" />
                      </span>
                    ) : (
                      <span className="inline-flex h-8 w-8 items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--text-primary)]">
                        <Sparkles className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {pendingItem ? (
        <ReplaceModal
          accessoryLeftItems={canvas.accessoriesLeft}
          accessoryRightItems={canvas.accessoriesRight}
          canvasTop={canvas.top}
          isAccessoryReplacement={isAccessoryReplacement}
          isTopReplacement={isTopReplacement}
          onCancel={() => setPendingItem(null)}
          onConfirmReplace={handleConfirmReplace}
          onReplaceAccessory={handleReplaceAccessory}
          onReplaceTop={handleReplaceTop}
          pendingItem={pendingItem}
        />
      ) : null}
    </section>
  );
}
