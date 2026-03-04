import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/Button';
import { useWardrobeStore } from '../store';
import { CATEGORY_LABELS, CATEGORIES, type Category, type WardrobeItem } from '../types';
import { getItemImageUrl } from '../api';

interface EditItemModalProps {
  isOpen: boolean;
  item: WardrobeItem | null;
  onClose: () => void;
}

export function EditItemModal({ isOpen, item, onClose }: EditItemModalProps) {
  const { updateItem, deleteItem, isLoading, error, clearError } = useWardrobeStore();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('tops');
  const [labels, setLabels] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category as Category);
      setLabels(item.labels.join(', '));
      setColors(item.colors || []);
      setSeasons(item.seasons || []);
    }
  }, [item]);

  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !name.trim()) return;

    try {
      const labelsList = labels
        .split(',')
        .map((l) => l.trim())
        .filter((l) => l);

      await updateItem(item.id, {
        name: name.trim(),
        category,
        labels: labelsList,
      });
      onClose();
    } catch (err) {
      console.error('Edit error:', err);
    }
  };

  const handleDelete = async () => {
    if (!item) return;

    try {
      await deleteItem(item.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleClose = () => {
    setShowDeleteConfirm(false);
    clearError();
    onClose();
  };

  if (!isOpen || !item) return null;

  const imageUrl = getItemImageUrl(item.image_path);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg)] w-full max-w-lg rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl text-[var(--text-primary)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Edit Item
            </h2>
            <button
              onClick={handleClose}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[var(--error)] bg-opacity-10 border border-[var(--error)] rounded text-sm text-[var(--error)]">
              {error}
            </div>
          )}

          {showDeleteConfirm ? (
            <div className="text-center py-6">
              <svg className="w-16 h-16 mx-auto text-[var(--error)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Delete Item?</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                This will permanently delete "{item.name}". This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[var(--error)] hover:bg-[var(--error)]/90"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {imageUrl && (
                <div className="mb-6 flex justify-center">
                  <img src={imageUrl} alt={item.name} className="max-h-64 w-auto object-contain" />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                    Name
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-category" className="block text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                    Category
                  </label>
                  <select
                    id="edit-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-labels" className="block text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    id="edit-labels"
                    type="text"
                    value={labels}
                    onChange={(e) => setLabels(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                {colors.length > 0 && (
                  <div>
                    <p className="block text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Colors</p>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <span key={color} className="px-3 py-1 bg-[var(--accent)]/20 text-[var(--accent)] text-sm rounded-full">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {seasons.length > 0 && (
                  <div>
                    <p className="block text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Seasons</p>
                    <div className="flex flex-wrap gap-2">
                      {seasons.map((season) => (
                        <span key={season} className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full">
                          {season}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 text-[var(--error)] hover:text-[var(--error)]"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete
                </Button>
                <Button type="submit" className="flex-1" disabled={!name.trim() || isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
