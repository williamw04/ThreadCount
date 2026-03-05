import { useState, useEffect } from 'react';
import { useOutfitBuilderStore } from '../store';
import { useWardrobeStore } from '@/features/wardrobe/store';
import { MAIN_CATEGORY_LABELS, type MainCategory, type OutfitItem } from '../types';
import { type Category } from '@/features/wardrobe/types';
import { supabase } from '@/shared/api/supabase';
import { Button } from '@/shared/ui/Button';

function getItemImageUrl(path: string | null): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from('wardrobe').getPublicUrl(path);
  return data.publicUrl;
}

const SLOT_TO_MAIN: Record<string, MainCategory> = {
  top: 'top',
  bottom: 'bottoms',
  shoes: 'shoes',
};

const CATEGORY_TO_SLOT: Record<Category, 'top' | 'bottom' | 'shoes'> = {
  tops: 'top',
  bottoms: 'bottom',
  dresses: 'top',
  outerwear: 'top',
  shoes: 'shoes',
  accessories: 'shoes',
};

const MAIN_CATEGORIES: MainCategory[] = ['top', 'bottoms', 'shoes', 'accessories'];

const SUB_CATEGORIES: Record<MainCategory, string[]> = {
  top: ['T-shirts', 'Tank tops', 'Dresses', 'Outerwear'],
  bottoms: ['Jeans', 'Dress pants'],
  shoes: ['Shoes'],
  accessories: ['Hats', 'Jewelry', 'Bags', 'Watches', 'Sunglasses', 'Other'],
};

const SUB_TO_CATEGORY: Record<string, Category[]> = {
  'T-shirts': ['tops'],
  'Tank tops': ['tops'],
  'Dresses': ['dresses'],
  'Outerwear': ['outerwear'],
  'Jeans': ['bottoms'],
  'Dress pants': ['bottoms'],
  'Shoes': ['shoes'],
  'Hats': ['accessories'],
  'Jewelry': ['accessories'],
  'Bags': ['accessories'],
  'Watches': ['accessories'],
  'Sunglasses': ['accessories'],
  'Other': ['accessories'],
};

const MAIN_TO_CATEGORY: Record<MainCategory, Category[]> = {
  top: ['tops', 'dresses', 'outerwear'],
  bottoms: ['bottoms'],
  shoes: ['shoes'],
  accessories: ['accessories'],
};

export function WardrobePanel() {
  const { addToSlot, removeFromSlot, canvas, selectedSlot } = useOutfitBuilderStore();
  const { items: wardrobeItems } = useWardrobeStore();
  const [selectedMain, setSelectedMain] = useState<MainCategory | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [pendingItem, setPendingItem] = useState<OutfitItem | null>(null);

  useEffect(() => {
    if (selectedSlot) {
      const main = SLOT_TO_MAIN[selectedSlot];
      if (main) {
        setSelectedMain(main);
        setSelectedSub(null);
      }
    }
  }, [selectedSlot]);

  const handleSelectMain = (main: MainCategory) => {
    setSelectedMain(main);
    setSelectedSub(null);
  };

  const handleSelectSub = (sub: string) => {
    setSelectedSub(sub);
  };

  const getTopItemIndex = (itemId: string): number => {
    return canvas.top.findIndex((item) => item.id === itemId);
  };

  const handleSelectItem = (item: { id: string; name: string; category: Category; image_path: string | null }) => {
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
    } else if (slot === 'bottom') {
      if (canvas.bottom?.id === item.id) {
        removeFromSlot('bottom');
        return;
      }
      if (canvas.bottom) {
        setPendingItem(outfitItem);
      } else {
        addToSlot('bottom', outfitItem);
      }
    } else if (slot === 'shoes') {
      if (canvas.shoes?.id === item.id) {
        removeFromSlot('shoes');
        return;
      }
      if (canvas.shoes) {
        setPendingItem(outfitItem);
      } else {
        addToSlot('shoes', outfitItem);
      }
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

  const isItemInCanvas = (itemId: string) => {
    const inTop = canvas.top.some((item) => item.id === itemId);
    const inBottom = canvas.bottom?.id === itemId;
    const inShoes = canvas.shoes?.id === itemId;
    return inTop || inBottom || inShoes;
  };

  const getFilteredItems = () => {
    if (!selectedMain) return wardrobeItems;

    if (selectedSub) {
      const categories = SUB_TO_CATEGORY[selectedSub] || [];
      return wardrobeItems.filter((item) => categories.includes(item.category));
    }

    const categories = MAIN_TO_CATEGORY[selectedMain];
    return wardrobeItems.filter((item) => categories.includes(item.category));
  };

  const filteredItems = getFilteredItems();
  const subCategories = selectedMain ? SUB_CATEGORIES[selectedMain] : [];

  return (
    <div className="flex flex-col h-full bg-[var(--bg-elevated)] rounded-lg border border-[var(--border)]">
      <div className="flex border-b border-[var(--border)]">
        {MAIN_CATEGORIES.map((main) => (
          <button
            key={main}
            onClick={() => handleSelectMain(main)}
            className={`
              flex-1 py-2 text-sm font-medium transition-colors
              ${selectedMain === main
                ? 'text-[var(--accent)] border-b-2 border-[var(--accent)] bg-[var(--accent)]/5'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}
            `}
          >
            {MAIN_CATEGORY_LABELS[main]}
          </button>
        ))}
      </div>

      {selectedMain && subCategories.length > 0 && (
        <div className="flex gap-1 p-2 border-b border-[var(--border)] overflow-x-auto">
          <button
            onClick={() => setSelectedSub(null)}
            className={`
              px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors border
              ${!selectedSub
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--bg-hover)] hover:border-[var(--accent)]'}
            `}
          >
            All
          </button>
          {subCategories.map((sub) => (
            <button
              key={sub}
              onClick={() => handleSelectSub(sub)}
              className={`
                px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors border
                ${selectedSub === sub
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--bg-hover)] hover:border-[var(--accent)]'}
              `}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-tertiary)]">
            <p>No items in this category</p>
            <p className="text-xs mt-1">Add items to your wardrobe first</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredItems.map((item) => {
              const imageUrl = getItemImageUrl(item.image_path);
              const inCanvas = isItemInCanvas(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`
                    flex flex-col items-center p-2 rounded-lg border transition-all
                    ${inCanvas
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                      : 'border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--bg-hover)]'}
                  `}
                >
                  <div className="w-14 h-14 flex items-center justify-center mb-1">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[var(--bg-secondary)] rounded flex items-center justify-center">
                        <span className="text-lg">👕</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] text-center truncate w-full">
                    {item.name}
                  </span>
                  {inCanvas && (
                    <span className="text-[10px] text-[var(--accent)]">Added</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {pendingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-xs bg-[var(--bg-elevated)] rounded-lg border border-[var(--border)] p-4">
            {canvas.top.length >= 2 && CATEGORY_TO_SLOT[pendingItem.category] === 'top' ? (
              <>
                <h3 className="font-semibold mb-2">Replace top?</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  You already have 2 tops. Choose which one to replace with {pendingItem.name}:
                </p>
                <div className="flex gap-2 mb-2">
                  {canvas.top.map((topItem, index) => (
                    <button
                      key={topItem.id}
                      onClick={() => handleReplaceTop(index)}
                      className="flex-1 p-2 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--bg-hover)] transition-all"
                    >
                      <div className="w-16 h-16 mx-auto mb-1 flex items-center justify-center">
                        {topItem.image_path && (
                          <img
                            src={getItemImageUrl(topItem.image_path) || ''}
                            alt={topItem.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        )}
                      </div>
                      <span className="text-xs text-[var(--text-secondary)] truncate">{topItem.name}</span>
                    </button>
                  ))}
                </div>
                <Button variant="ghost" onClick={() => setPendingItem(null)} className="w-full">
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <h3 className="font-semibold mb-2">Replace item?</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  This slot already has an item. Replace it with {pendingItem.name}?
                </p>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setPendingItem(null)} className="flex-1">
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleConfirmReplace} className="flex-1">
                    Replace
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
