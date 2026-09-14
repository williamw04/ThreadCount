import type { WardrobeItem } from '../types';
import { WardrobeItemCard } from './WardrobeItemCard';

interface WardrobeGridProps {
  items: WardrobeItem[];
  onItemClick?: (item: WardrobeItem) => void;
}

export function WardrobeGrid({ items, onItemClick }: WardrobeGridProps) {
  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
      role="list"
    >
      {items.map((item) => (
        <WardrobeItemCard key={item.id} item={item} onClick={() => onItemClick?.(item)} />
      ))}
    </div>
  );
}
