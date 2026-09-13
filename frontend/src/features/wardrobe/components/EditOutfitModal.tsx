import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { WardrobeModalFrame } from './WardrobeModalFrame';
import { supabase } from '@/shared/api/supabase';

/**
 * Edit modal for user-uploaded outfit photos.
 *
 * Unlike EditItemModal, this component accesses the `outfits` table directly
 * via Supabase rather than through the API layer. This is because the wardrobe
 * feature treats uploaded outfits as a secondary data type — they have no
 * dedicated REST endpoints for name updates; the generic outfit PUT endpoint
 * is used via Supabase client instead.
 *
 * On delete, the associated image is removed from the `generated` storage bucket
 * before the database record is deleted to avoid orphaned files.
 */
interface UploadedOutfit {
  id: string;
  name: string | null;
  item_ids: string[];
  thumbnail_path: string | null;
  created_at: string;
}

interface EditOutfitModalProps {
  isOpen: boolean;
  outfit: UploadedOutfit | null;
  onClose: () => void;
  onUpdateSuccess: () => void;
}

export function EditOutfitModal({
  isOpen,
  outfit,
  onClose,
  onUpdateSuccess,
}: EditOutfitModalProps) {
  // The parent mounts this modal keyed by outfit id only while open, so state
  // starts fresh per outfit and per opening; no sync effects needed.
  const [name, setName] = useState(outfit?.name ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outfit) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error: err } = await supabase
        .from('outfits')
        .update({ name: name.trim() || null })
        .eq('id', outfit.id);

      if (err) throw err;
      onUpdateSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update outfit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!outfit) return;

    setIsLoading(true);
    setError(null);

    try {
      if (outfit.thumbnail_path) {
        const { error: storageError } = await supabase.storage
          .from('generated')
          .remove([outfit.thumbnail_path]);
        if (storageError) console.error('Failed to delete image:', storageError);
      }

      const { error: dbError } = await supabase.from('outfits').delete().eq('id', outfit.id);
      if (dbError) throw dbError;

      onUpdateSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete outfit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowDeleteConfirm(false);
    setError(null);
    onClose();
  };

  if (!isOpen || !outfit) return null;

  const imageUrl = outfit.thumbnail_path
    ? supabase.storage.from('generated').getPublicUrl(outfit.thumbnail_path).data.publicUrl
    : null;

  return (
    <WardrobeModalFrame
      description="Edit the outfit name or remove it from your archive."
      onClose={handleClose}
      title="Edit Outfit"
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
              Delete Outfit
            </h3>
            <p className="mx-auto max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
              Remove this outfit from your archive. This action cannot be undone.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={() => setShowDeleteConfirm(false)} type="button" variant="secondary">
              Keep Outfit
            </Button>
            <Button className="min-w-36" disabled={isLoading} onClick={handleDelete} type="button">
              {isLoading ? 'Deleting...' : 'Delete Outfit'}
            </Button>
          </div>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
            <section className="border border-[var(--border-strong)] bg-[var(--bg-elevated)]">
              {imageUrl ? (
                <div className="flex min-h-[22rem] items-center justify-center border-b border-[var(--border)] bg-[var(--bg-muted)] p-6">
                  <img
                    alt={outfit.name || 'Outfit'}
                    className="max-h-80 w-auto object-contain"
                    src={imageUrl}
                  />
                </div>
              ) : (
                <div className="flex min-h-[22rem] items-center justify-center border-b border-[var(--border)] bg-[var(--bg-muted)] p-6 text-center text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Image unavailable
                </div>
              )}
              <div className="space-y-4 p-5">
                <p className="eyebrow text-[var(--text-muted)]">Uploaded</p>
                <p className="text-sm uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                  {new Date(outfit.created_at).toLocaleDateString()}
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <Input
                className="border-[var(--border-strong)] bg-[var(--bg-elevated)]"
                id="edit-outfit-name"
                label="Name"
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Summer Date Night"
                value={name}
              />
            </section>
          </div>

          <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Button onClick={() => setShowDeleteConfirm(true)} type="button" variant="ghost">
              Delete Outfit
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={handleClose} type="button" variant="secondary">
                Cancel
              </Button>
              <Button disabled={isLoading} type="submit">
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </WardrobeModalFrame>
  );
}
