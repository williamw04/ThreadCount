import { useEffect, useState, useRef } from 'react';
import { useOutfitBuilderStore } from '../store';
import { useWardrobeStore } from '@/features/wardrobe/store';
import { SLOT_CATEGORIES, type OutfitItem } from '../types';
import { CATEGORY_LABELS, type Category } from '@/features/wardrobe/types';
import { supabase } from '@/shared/api/supabase';

function getItemImageUrl(path: string | null): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from('wardrobe').getPublicUrl(path);
  return data.publicUrl;
}

const TAB_ORDER: Category[] = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'];

export function WardrobePanel() {
  const { selectedSlot, addToSlot, canvas } = useOutfitBuilderStore();
  const { items: wardrobeItems } = useWardrobeStore();
  const [activeTab, setActiveTab] = useState<Category>('tops');
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedSlot) {
      const slotCategories = SLOT_CATEGORIES[selectedSlot];
      if (slotCategories.includes(activeTab)) return;
      const firstCategory = slotCategories[0];
      if (firstCategory) {
        setActiveTab(firstCategory);
      }
    }
    // Intentionally only depend on selectedSlot to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlot]);

  const handleTabClick = (category: Category) => {
    setActiveTab(category);
  };

  const filteredItems = wardrobeItems.filter((item) => item.category === activeTab);

  const handleSelectItem = (item: { id: string; name: string; category: Category; image_path: string | null }) => {
    if (!selectedSlot) return;
    
    const outfitItem: OutfitItem = {
      id: item.id,
      name: item.name,
      category: item.category,
      image_path: item.image_path,
    };
    addToSlot(selectedSlot, outfitItem);
  };

  const isItemInCanvas = (itemId: string) => {
    const inTop = canvas.top.some((item) => item.id === itemId);
    const inBottom = canvas.bottom?.id === itemId;
    const inShoes = canvas.shoes?.id === itemId;
    return inTop || inBottom || inShoes;
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-elevated)] rounded-lg border border-[var(--border)]">
      <div className="p-4 border-b border-[var(--border)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Wardrobe</h2>
        {selectedSlot && (
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Select a {selectedSlot} to add
          </p>
        )}
      </div>

      <div 
        ref={tabsRef}
        className="flex overflow-x-auto gap-1 p-2 border-b border-[var(--border)] scrollbar-hide"
      >
        {TAB_ORDER.map((category) => (
          <button
            key={category}
            onClick={() => handleTabClick(category)}
            className={`
              flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap
              transition-colors
              ${activeTab === category
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }
            `}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-tertiary)]">
            <p>No items in this category</p>
            <p className="text-xs mt-1">Add items to your wardrobe first</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => {
              const imageUrl = getItemImageUrl(item.image_path);
              const inCanvas = isItemInCanvas(item.id);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  disabled={!selectedSlot}
                  className={`
                    flex flex-col items-center p-2 rounded-lg border transition-all
                    ${inCanvas 
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                      : 'border-[var(--border)] hover:border-[var(--color-primary)] hover:bg-[var(--bg-hover)]'
                    }
                    ${!selectedSlot ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="w-16 h-16 flex items-center justify-center mb-2">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-[var(--bg-secondary)] rounded flex items-center justify-center">
                        <span className="text-xl">👕</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] text-center truncate w-full">
                    {item.name}
                  </span>
                  {inCanvas && (
                    <span className="text-[10px] text-[var(--color-primary)]">In outfit</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
