import type { Look } from '../types';
import { LookCard } from './LookCard';

/**
 * Masonry grid layout for displaying looks.
 * Uses CSS `columns-2/3/4` for responsive masonry without JavaScript.
 * Empty state guides users to create looks via the Outfit Builder or wardrobe upload.
 */
interface LooksGridProps {
  looks: Look[];
  onLookClick: (look: Look) => void;
}

export function LooksGrid({ looks, onLookClick }: LooksGridProps) {
  if (looks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-400"
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
        <p className="text-gray-500 text-lg">No looks yet</p>
        <p className="text-gray-400 text-sm mt-1">
          Upload an outfit or create a look in the Outfit Builder to get started
        </p>
      </div>
    );
  }

  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 p-4">
      {looks.map((look) => (
        <LookCard key={look.id} look={look} onClick={() => onLookClick(look)} />
      ))}
    </div>
  );
}
