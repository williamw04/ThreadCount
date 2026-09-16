import { useState } from 'react';
import type { Look } from '../types';
import * as api from '../api';

/**
 * Full-size detail view for a look, opened from the grid.
 *
 * Shows the look image alongside metadata (type, name, date).
 * For rendered looks, also displays the generation prompt if available.
 * Includes a delete flow with inline confirmation to prevent accidental deletion.
 */
interface LookDetailModalProps {
  look: Look;
  onClose: () => void;
  onDelete: (lookId: string) => Promise<void>;
}

export function LookDetailModal({ look, onClose, onDelete }: LookDetailModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const imageUrl =
    look.type === 'saved' ? api.getOutfitImageUrl(look.thumbnail_path) : look.image_url;

  const formattedDate = new Date(look.created_at).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(look.id);
      onClose();
    } catch {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row max-h-[90vh]">
          <div className="flex-1 bg-gray-100 flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={(look.type === 'saved' && look.name) || 'Look'}
                className="max-w-full max-h-[60vh] object-contain"
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-gray-200">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>

          <div className="w-full md:w-80 p-6 flex flex-col bg-white">
            <div className="flex-1">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                  look.type === 'saved'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {look.type === 'saved' ? 'Saved Outfit' : 'AI Render'}
              </span>

              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {(look.type === 'saved' && look.name) ||
                  (look.type === 'saved' ? 'Saved Outfit' : 'AI Render')}
              </h2>

              <p className="text-gray-500 text-sm mb-4">{formattedDate}</p>

              {look.type === 'rendered' && look.prompt && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Prompt</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg line-clamp-4">
                    {look.prompt}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              {showConfirm ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    Are you sure you want to delete this look?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="w-full py-2 px-4 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  Delete Look
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
