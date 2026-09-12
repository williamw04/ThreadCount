import type { Look } from '../types';
import * as api from '../api';

/**
 * Individual look card in the masonry grid.
 *
 * Image source depends on look type:
 * - 'saved': uses `getOutfitImageUrl(thumbnail_path)` from the `generated` bucket
 * - 'rendered': uses `image_url` directly (already a full URL)
 *
 * The hover overlay shows name, date, and a type badge (Saved/Render).
 * Uses `break-inside-avoid` for CSS columns masonry layout.
 */
interface LookCardProps {
  look: Look;
  onClick: () => void;
}

export function LookCard({ look, onClick }: LookCardProps) {
  const imageUrl =
    look.type === 'saved' ? api.getOutfitImageUrl(look.thumbnail_path) : look.image_url;

  const formattedDate = new Date(look.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer break-inside-avoid mb-4 overflow-hidden rounded-xl bg-gray-100"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={(look.type === 'saved' && look.name) || 'Look'}
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="aspect-[3/4] flex items-center justify-center bg-gray-200">
          <span className="text-gray-400">No image</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white font-medium truncate">
            {(look.type === 'saved' && look.name) ||
              (look.type === 'saved' ? 'Saved Outfit' : 'AI Render')}
          </p>
          <p className="text-white/70 text-sm">{formattedDate}</p>
        </div>
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            look.type === 'saved' ? 'bg-blue-500/90 text-white' : 'bg-purple-500/90 text-white'
          }`}
        >
          {look.type === 'saved' ? 'Saved' : 'Render'}
        </span>
      </div>
    </div>
  );
}
