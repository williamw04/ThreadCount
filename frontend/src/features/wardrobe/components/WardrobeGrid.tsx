import type { WardrobeItem } from '../types';
import { WardrobeItemCard } from './WardrobeItemCard';

interface WardrobeGridProps {
  items: WardrobeItem[];
  onItemClick?: (item: WardrobeItem) => void;
}

export function WardrobeGrid({ items, onItemClick }: WardrobeGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-4">
      {items.map((item) => (
        <WardrobeItemCard key={item.id} item={item} onClick={() => onItemClick?.(item)} />
      ))}
    </div>
  );
}
