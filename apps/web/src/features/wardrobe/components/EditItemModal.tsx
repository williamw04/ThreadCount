import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useWardrobeStore } from '../store';
import { CATEGORY_LABELS, CATEGORIES, type Category, type WardrobeItem } from '../types';
import { getItemImageUrl } from '../api';
import { WardrobeBadgeList } from './WardrobeBadgeList';
import { WardrobeModalFrame } from './WardrobeModalFrame';

/**
 * Edit modal for existing wardrobe items.
 *
 * Users can modify name, category, and tags. Colors and seasons are displayed
 * as read-only badges because they are AI-detected metadata — the edit API
 * accepts them but the UI intentionally prevents manual override to keep
 * metadata consistent with the Gemini analysis source.
 * Image replacement is not yet supported (see product-spec § Remaining Work).
 */
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
  const selectClassName =
    'w-full border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--focus)]';

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category as Category);
      setLabels(item.labels.join(', '));
      setColors(item.colors || []);
      setSeasons(item.seasons || []);
    }
  }, [item]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false);
    }
  }, [isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
    } catch {
      // Error handling
    }
  };

  const handleDelete = async () => {
    if (!item) return;

    try {
      await deleteItem(item.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch {
      // Error handling
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
    <WardrobeModalFrame
      description="Adjust naming, category placement, and labels while keeping the item record intact."
      onClose={handleClose}
      title="Edit Item"
    >
      {error && (
        <div
          className="mb-5 border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-primary)]"
          role="alert"
        >
          {error}
        </div>
      )}

      {showDeleteConfirm ? (
        <div className="space-y-6 border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-6 text-center sm:p-8">
          <svg
            className="mx-auto h-16 w-16 text-[var(--text-primary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          <div className="space-y-3">
            <p className="eyebrow text-[var(--text-muted)]">Permanent action</p>
            <h3 className="text-2xl font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
              Delete Item
            </h3>
            <p className="mx-auto max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
              Remove {item.name} from the wardrobe. This action cannot be undone.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={() => setShowDeleteConfirm(false)} type="button" variant="secondary">
              Keep Item
            </Button>
            <Button className="min-w-36" disabled={isLoading} onClick={handleDelete} type="button">
              {isLoading ? 'Deleting...' : 'Delete Item'}
            </Button>
          </div>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
            <section className="border border-[var(--border-strong)] bg-[var(--bg-elevated)]">
              {imageUrl ? (
                <div className="flex min-h-[22rem] items-center justify-center border-b border-[var(--border)] bg-[var(--bg-muted)] p-6">
                  <img alt={item.name} className="max-h-80 w-auto object-contain" src={imageUrl} />
                </div>
              ) : (
                <div className="flex min-h-[22rem] items-center justify-center border-b border-[var(--border)] bg-[var(--bg-muted)] p-6 text-center text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Image unavailable
                </div>
              )}
              <div className="space-y-4 p-5">
                <p className="eyebrow text-[var(--text-muted)]">Detected metadata</p>
                <WardrobeBadgeList label="Colors" values={colors} />
                <WardrobeBadgeList label="Seasons" values={seasons} />
              </div>
            </section>

            <section className="space-y-4">
              <Input
                className="border-[var(--border-strong)] bg-[var(--bg-elevated)]"
                id="edit-name"
                label="Name"
                onChange={(e) => setName(e.target.value)}
                required
                value={name}
              />

              <div className="space-y-2">
                <label
                  className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-secondary)]"
                  htmlFor="edit-category"
                >
                  Category
                </label>
                <select
                  className={selectClassName}
                  id="edit-category"
                  onChange={(e) => setCategory(e.target.value as Category)}
                  value={category}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                className="border-[var(--border-strong)] bg-[var(--bg-elevated)]"
                id="edit-labels"
                label="Tags"
                onChange={(e) => setLabels(e.target.value)}
                value={labels}
              />
            </section>
          </div>

          <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Button onClick={() => setShowDeleteConfirm(true)} type="button" variant="ghost">
              Delete Item
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={handleClose} type="button" variant="secondary">
                Cancel
              </Button>
              <Button disabled={!name.trim() || isLoading} type="submit">
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </WardrobeModalFrame>
  );
}
