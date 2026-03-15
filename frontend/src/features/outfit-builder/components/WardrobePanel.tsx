import { useEffect, useMemo, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { useOutfitBuilderStore } from '../store';
import {
  MAIN_CATEGORY_LABELS,
  type OutfitItem,
  type OutfitSlot,
} from '../types';
import { getItemImageUrl } from '../api';
import { useWardrobeStore } from '@/features/wardrobe/store';
import { Card } from '@/shared/ui/Card';
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

function formatSlotLabel(slot: OutfitSlot | null) {
  if (!slot) return 'No focused zone';
  if (slot === 'accessoriesLeft') return 'Left accessory rail';
  if (slot === 'accessoriesRight') return 'Right accessory rail';
  return slot === 'bottom' ? 'Bottom zone' : `${MAIN_CATEGORY_LABELS[SLOT_TO_MAIN[slot]]} zone`;
}

export function WardrobePanel() {
  const { addToSlot, canvas, removeFromSlot, selectedSlot } = useOutfitBuilderStore();
  const { items: wardrobeItems, isLoading } = useWardrobeStore();
  const [selectedMain, setSelectedMain] = useState<MainCategory | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [pendingItem, setPendingItem] = useState<OutfitItem | null>(null);

  const effectiveMain = selectedSlot ? SLOT_TO_MAIN[selectedSlot] : selectedMain;
  const subCategories = effectiveMain ? SUB_CATEGORIES[effectiveMain] : [];

  useEffect(() => {
    setSelectedSub(null);
  }, [selectedSlot]);

  const filteredItems = useMemo(() => {
    if (!effectiveMain) {
      return wardrobeItems;
    }

    if (selectedSub) {
      const categories = SUB_TO_CATEGORY[selectedSub] || [];
      return wardrobeItems.filter((item) => categories.includes(item.category));
    }

    const categories = MAIN_TO_CATEGORY[effectiveMain];
    return wardrobeItems.filter((item) => categories.includes(item.category));
  }, [effectiveMain, selectedSub, wardrobeItems]);

  const handleSelectMain = (main: MainCategory) => {
    setSelectedMain(main);
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
    <Card className="flex h-full min-h-0 flex-col border-[var(--border-strong)]" padding="none">
      <div className="flex-none border-b border-[var(--border)] px-4 py-4">
        <p className="eyebrow text-[var(--text-muted)]">Wardrobe rail</p>
        <h2 className="mt-2 text-lg font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
          Pull pieces into the canvas
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
          <span className="border border-[var(--border)] px-2.5 py-1.5">{formatSlotLabel(selectedSlot)}</span>
          <span className="border border-[var(--border)] px-2.5 py-1.5">
            {filteredItems.length} visible item{filteredItems.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="flex-none border-b border-[var(--border)] p-3">
        <div className="grid grid-cols-2 gap-2">
          {MAIN_CATEGORIES.map((main) => {
            const isActive = effectiveMain === main;

            return (
              <button
                key={main}
                type="button"
                onClick={() => handleSelectMain(main)}
                className={[
                  'border px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.22em] transition-colors',
                  isActive
                    ? 'border-[var(--border-strong)] bg-[var(--surface-inverse)] text-[var(--text-inverse)]'
                    : 'border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]',
                ].join(' ')}
              >
                {MAIN_CATEGORY_LABELS[main]}
              </button>
            );
          })}
        </div>

        {effectiveMain ? (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedSub(null)}
              className={[
                'border px-3 py-2 text-[10px] font-medium uppercase tracking-[0.22em] whitespace-nowrap transition-colors',
                !selectedSub
                  ? 'border-[var(--border-strong)] bg-[var(--surface-inverse)] text-[var(--text-inverse)]'
                  : 'border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]',
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
                  'border px-3 py-2 text-[10px] font-medium uppercase tracking-[0.22em] whitespace-nowrap transition-colors',
                  selectedSub === sub
                    ? 'border-[var(--border-strong)] bg-[var(--surface-inverse)] text-[var(--text-inverse)]'
                    : 'border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]',
                ].join(' ')}
              >
                {sub}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <SurfaceMessage
            className="h-full px-4 py-6"
            description="Pulling wardrobe inventory into the selection rail."
            kicker="Loading"
            title="Preparing pieces"
          />
        ) : filteredItems.length === 0 ? (
          <SurfaceMessage
            className="h-full px-4 py-6"
            description="No wardrobe items match this selection. Add inventory or switch to another category edit."
            kicker="Empty rail"
            title="No pieces available"
          />
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredItems.map((item) => {
              const imageUrl = getItemImageUrl(item.image_path);
              const inCanvas = isItemInCanvas(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectItem(item)}
                  className={[
                    'group flex flex-col border p-3 text-left transition-colors',
                    inCanvas
                      ? 'border-[var(--border-strong)] bg-[var(--bg)]'
                      : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-strong)] hover:bg-[var(--bg)]',
                  ].join(' ')}
                >
                  <div className="flex aspect-square items-center justify-center border border-[var(--border)] bg-[color:rgba(244,244,239,0.65)] p-4">
                    {imageUrl ? (
                      <img src={imageUrl} alt={item.name} className="max-h-full max-w-full object-contain" />
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
                      <span className="inline-flex h-8 w-8 items-center justify-center border border-[var(--border-strong)] bg-[var(--surface-inverse)] text-[var(--text-inverse)]">
                        <Check className="h-4 w-4" />
                      </span>
                    ) : (
                      <span className="inline-flex h-8 w-8 items-center justify-center border border-[var(--border)] text-[var(--text-muted)] group-hover:border-[var(--border-strong)] group-hover:text-[var(--text-primary)]">
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
    </Card>
  );
}
