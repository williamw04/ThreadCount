import type { WardrobeItem } from '../types';
import { getItemImageUrl } from '../api';
import { CATEGORY_LABELS } from '../types';
import { useState } from 'react';

interface WardrobeItemCardProps {
  item: WardrobeItem;
  onClick?: () => void;
}

export function WardrobeItemCard({ item, onClick }: WardrobeItemCardProps) {
  const imageUrl = getItemImageUrl(item.image_path);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group relative cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={item.name}
          className="w-full h-auto object-contain transition-transform duration-200 group-hover:scale-105"
        />
      ) : (
        <div className="w-full aspect-square flex items-center justify-center bg-[var(--bg-elevated)] rounded-lg">
          <svg
            className="w-12 h-12 text-[var(--text-tertiary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {isHovered && (
        <div className="absolute inset-0 flex items-end pointer-events-none">
          <div className="w-full bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3 rounded-b">
            <p className="text-sm font-medium text-white truncate">{item.name}</p>
            <p className="text-xs text-white/70">{CATEGORY_LABELS[item.category]}</p>
          </div>
        </div>
      )}

      {item.is_template && (
        <div className="absolute top-0 left-0 px-2 py-1 bg-[var(--accent)] text-white text-xs rounded-br">
          Sample
        </div>
      )}
    </div>
  );
}
