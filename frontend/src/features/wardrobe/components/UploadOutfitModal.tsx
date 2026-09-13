import { useState, useRef } from 'react';
import { clsx } from 'clsx';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { WardrobeModalFrame } from './WardrobeModalFrame';
import { supabase } from '@/shared/api/supabase';

/**
 * Upload modal for complete outfit photos.
 *
 * Unlike UploadModal (which uses the wardrobe store and API module),
 * this component calls POST /api/outfits/upload directly with a manually
 * constructed FormData. The outfit upload endpoint is separate from the
 * wardrobe item creation flow — it stores the image in the `generated`
 * bucket and creates an outfit record with empty `item_ids`.
 *
 * This component fetches the auth token inline rather than going through
 * the shared `getAuthToken` helper because the wardrobe API module
 * doesn't export an outfit upload function.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface UploadOutfitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export function UploadOutfitModal({ isOpen, onClose, onUploadSuccess }: UploadOutfitModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // The parent mounts this modal only while open, so state resets on close by unmounting.

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setError(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const dt = new DataTransfer();
      dt.items.add(file);
      if (inputRef.current) {
        inputRef.current.files = dt.files;
        const event = { target: { files: dt.files } } as React.ChangeEvent<HTMLInputElement>;
        handleFileSelect(event);
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be logged in');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      formData.append('user_id', user.id);
      if (name.trim()) {
        formData.append('name', name.trim());
      }
      formData.append('image', selectedFile);

      const response = await fetch(`${API_BASE_URL}/api/outfits/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(err.detail || 'Upload failed');
      }

      await response.json();
      onUploadSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload outfit');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setPreview(null);
    setSelectedFile(null);
    setIsUploading(false);
    setName('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <WardrobeModalFrame
      description="Upload a complete outfit photo directly to your archive."
      onClose={handleClose}
      title="Add Outfit"
    >
      {error && (
        <div
          className="mb-5 border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-primary)]"
          role="alert"
        >
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <section className="space-y-4">
            <div className="relative min-h-[22rem] border border-[var(--border-strong)] bg-[var(--bg-elevated)]">
              {!preview ? (
                <div
                  className={clsx(
                    'flex min-h-[22rem] cursor-pointer flex-col items-center justify-center border-2 border-dashed border-[var(--border)] px-6 text-center transition-colors hover:border-[var(--border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]',
                  )}
                  onClick={() => inputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      inputRef.current?.click();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <input
                    ref={inputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                    type="file"
                  />
                  <svg
                    className="h-12 w-12 text-[var(--text-muted)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                    />
                  </svg>
                  <p className="mt-5 text-lg font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
                    Drop image or browse
                  </p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">
                    Upload a complete outfit photo. JPG and PNG files up to 10MB are supported.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex min-h-[22rem] items-center justify-center bg-[var(--bg-muted)] p-6">
                    <img
                      alt="Outfit preview"
                      className="max-h-80 w-auto object-contain"
                      src={preview}
                    />
                  </div>
                  <div className="absolute left-3 top-3 border border-[var(--border-strong)] bg-[var(--surface-inverse)] px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-[var(--text-inverse)]">
                    Image selected
                  </div>
                  <button
                    className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center border border-[var(--border-strong)] bg-[var(--bg)] text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-inverse)] hover:text-[var(--text-inverse)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
                    disabled={isUploading}
                    onClick={handleRemove}
                    type="button"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M6 18L18 6M6 6l12 12"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <Input
              className="border-[var(--border-strong)] bg-[var(--bg-elevated)]"
              id="outfit-name"
              label="Name (optional)"
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Summer Date Night"
              value={name}
            />

            <div className="border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
              <p className="eyebrow text-[var(--text-muted)]">About uploads</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Upload complete outfit photos directly. These will appear alongside your composed
                outfits in the archive.
              </p>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
          <Button className="sm:min-w-36" onClick={handleClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button className="sm:min-w-36" disabled={!selectedFile || isUploading} type="submit">
            {isUploading ? 'Uploading...' : 'Add Outfit'}
          </Button>
        </div>
      </form>
    </WardrobeModalFrame>
  );
}
