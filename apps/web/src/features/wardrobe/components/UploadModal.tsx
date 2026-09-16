/* eslint-disable max-lines -- ponytail: pre-existing 377 lines, split when next touched */
import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useWardrobeStore } from '../store';
import { CATEGORY_LABELS, CATEGORIES, type Category } from '../types';
import { removeBackground, analyzeImage } from '../api';
import { useAuthStore } from '@/features/auth/store';
import { WardrobeBadgeList } from './WardrobeBadgeList';
import { WardrobeModalFrame } from './WardrobeModalFrame';

/**
 * Upload modal for adding individual wardrobe items.
 *
 * Processing pipeline:
 * 1. User selects/drops an image → local preview via FileReader
 * 2. Background removal via fal.ai (POST /api/image/remove-background)
 * 3. AI metadata extraction via Gemini (POST /api/ai/analyze) — runs in parallel,
 *    non-blocking: if analysis fails, the user can still save with manually entered data
 * 4. User reviews the processed preview + auto-populated fields, then submits
 *
 * Both background removal and analysis operate on the original uploaded file,
 * not the processed image. The processed image path is stored separately and
 * passed to `createWardrobeItem` as `imagePath` to avoid a second upload.
 *
 * See docs/features/virtual-wardrobe/product-spec.md § Upload Items.
 */
interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const { addItem, isLoading, error, clearError } = useWardrobeStore();
  const { user } = useAuthStore();
  const [preview, setPreview] = useState<string | null>(null);
  const [processedImagePath, setProcessedImagePath] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<string>('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('tops');
  const [labels, setLabels] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectClassName =
    'w-full border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--focus)]';

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isOpen) {
      setPreview(null);
      setProcessedImagePath(null);
      setIsProcessing(false);
      setProcessingProgress('');
      setName('');
      setCategory('tops');
      setLabels('');
      setColors([]);
      setSeasons([]);
    }
  }, [isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      return;
    }

    if (!user) {
      return;
    }

    clearError();

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsProcessing(true);
    setProcessingProgress('Processing image...');

    try {
      const bgResult = await removeBackground(user.id, file);
      setPreview(bgResult.processedImageUrl);
      setProcessedImagePath(bgResult.storagePath);

      // AI analysis is intentionally non-blocking — if it fails, the user
      // can still manually fill in name, category, and tags.
      try {
        const analysis = await analyzeImage(file);

        if (analysis.suggested_name) {
          setName(analysis.suggested_name);
        }
        if (analysis.suggested_category) {
          setCategory(analysis.suggested_category as Category);
        }
        if (analysis.tags && analysis.tags.length > 0) {
          setLabels(analysis.tags.join(', '));
        }
        if (analysis.colors && analysis.colors.length > 0) {
          setColors(analysis.colors);
        }
        if (analysis.seasons && analysis.seasons.length > 0) {
          setSeasons(analysis.seasons);
        }
      } catch {
        // AI analysis skipped
      }

      setIsProcessing(false);
      setProcessingProgress('');
    } catch {
      setIsProcessing(false);
      setProcessingProgress('');
    }
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
    setProcessedImagePath(null);
    setIsProcessing(false);
    setProcessingProgress('');
    setName('');
    setCategory('tops');
    setLabels('');
    setColors([]);
    setSeasons([]);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !processedImagePath) return;

    try {
      const labelsList = labels
        .split(',')
        .map((l) => l.trim())
        .filter((l) => l);

      await addItem(
        name.trim(),
        category,
        undefined,
        labelsList,
        processedImagePath,
        colors,
        seasons,
      );
      onClose();
    } catch {
      // Error handling
    }
  };

  const handleClose = () => {
    setPreview(null);
    setProcessedImagePath(null);
    setIsProcessing(false);
    setProcessingProgress('');
    setName('');
    setCategory('tops');
    setLabels('');
    setColors([]);
    setSeasons([]);
    clearError();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <WardrobeModalFrame
      description="Upload a clean product image, review the AI metadata, and file the piece into your wardrobe."
      onClose={handleClose}
      title="Add Item"
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
            <div
              aria-busy={isProcessing}
              className="relative min-h-[22rem] border border-[var(--border-strong)] bg-[var(--bg-elevated)]"
            >
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
                    Use a clean front-facing item photo. JPG and PNG files up to 10MB are supported.
                  </p>
                  <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    AI extracts colors, seasons, and tags automatically
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex min-h-[22rem] items-center justify-center bg-[var(--bg-muted)] p-6">
                    <img
                      alt="Wardrobe item preview"
                      className="max-h-80 w-auto object-contain"
                      src={preview}
                    />
                  </div>
                  {isProcessing ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[color:rgba(17,17,17,0.76)] p-6 text-center text-[var(--text-inverse)]">
                      <div className="space-y-3">
                        <div className="mx-auto h-12 w-12 animate-spin border-2 border-[var(--text-inverse)] border-t-transparent" />
                        <p className="text-[11px] uppercase tracking-[0.2em]">
                          {processingProgress}
                        </p>
                      </div>
                    </div>
                  ) : null}
                  <div className="absolute left-3 top-3 border border-[var(--border-strong)] bg-[var(--surface-inverse)] px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-[var(--text-inverse)]">
                    {processedImagePath ? 'Ready to save' : 'Image selected'}
                  </div>
                  <button
                    className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center border border-[var(--border-strong)] bg-[var(--bg)] text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-inverse)] hover:text-[var(--text-inverse)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
                    disabled={isProcessing}
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
              id="name"
              label="Name"
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Denim Jacket"
              required
              value={name}
            />

            <div className="space-y-2">
              <label
                className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-secondary)]"
                htmlFor="category"
              >
                Category
              </label>
              <select
                className={selectClassName}
                id="category"
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
              id="labels"
              label="Tags"
              onChange={(e) => setLabels(e.target.value)}
              placeholder="e.g., tailored, daywear, cotton"
              value={labels}
            />

            <div className="border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
              <p className="eyebrow text-[var(--text-muted)]">AI metadata</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Auto-detected details stay editable through the item record after upload.
              </p>
              <WardrobeBadgeList className="mt-4" label="Colors" values={colors} />
              <WardrobeBadgeList className="mt-4" label="Seasons" values={seasons} />
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
          <Button className="sm:min-w-36" onClick={handleClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button
            className="sm:min-w-36"
            disabled={!processedImagePath || !name.trim() || isLoading || isProcessing}
            type="submit"
          >
            {isProcessing ? 'Processing...' : isLoading ? 'Adding...' : 'Add Item'}
          </Button>
        </div>
      </form>
    </WardrobeModalFrame>
  );
}
