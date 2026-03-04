import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { Button } from '@/shared/ui/Button';
import { useWardrobeStore } from '../store';
import { CATEGORY_LABELS, CATEGORIES, type Category } from '../types';
import { removeBackground, analyzeImage } from '../api';
import { useAuthStore } from '@/features/auth/store';

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
      
      // Try AI analysis, but don't block on it
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
      } catch (aiError) {
        console.warn('AI analysis skipped:', aiError);
      }
      
      setIsProcessing(false);
      setProcessingProgress('');
    } catch (err) {
      console.error('Processing failed:', err);
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

      await addItem(name.trim(), category, undefined, labelsList, processedImagePath, colors, seasons);
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg)] w-full max-w-lg rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl text-[var(--text-primary)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Add Item
            </h2>
            <button
              onClick={handleClose}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[var(--error)] bg-opacity-10 border border-[var(--error)] rounded text-sm text-[var(--error)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!preview ? (
              <div
                className={clsx(
                  'border-2 border-dashed rounded-lg p-8 text-center transition-colors mb-6',
                  'border-[var(--border)] hover:border-[var(--accent)] cursor-pointer',
                )}
                onClick={() => inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div className="mb-4">
                  <svg
                    className="w-10 h-10 mx-auto text-[var(--text-tertiary)]"
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
                <p className="text-sm text-[var(--text-secondary)] mb-1">
                  Drop your photo here or click to browse
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">JPG, PNG up to 10MB</p>
                <p className="text-xs text-[var(--accent)] mt-2">AI will auto-detect colors, seasons & tags</p>
              </div>
            ) : (
              <div className="relative mb-6">
                <div className="flex justify-center">
                  <img src={preview} alt="Preview" className="max-h-64 w-auto object-contain" />
                </div>
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-white text-sm">{processingProgress}</p>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[var(--bg-elevated)] shadow-md flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--error)] transition-colors z-20"
                  disabled={isProcessing}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                {!isProcessing && processedImagePath && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded z-20">
                    Ready to save
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  placeholder="e.g., Blue Denim Jacket"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2"
                >
                  Category
                </label>
                <select
                  id="category"
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

              {(colors.length > 0 || seasons.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <span key={color} className="px-2 py-1 bg-[var(--accent)]/20 text-[var(--accent)] text-xs rounded">
                      {color}
                    </span>
                  ))}
                  {seasons.map((season) => (
                    <span key={season} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                      {season}
                    </span>
                  ))}
                </div>
              )}

              <div>
                <label
                  htmlFor="labels"
                  className="block text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2"
                >
                  Tags (comma-separated)
                </label>
                <input
                  id="labels"
                  type="text"
                  value={labels}
                  onChange={(e) => setLabels(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  placeholder="e.g., casual, blue, summer"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!processedImagePath || !name.trim() || isLoading || isProcessing}
              >
                {isProcessing ? 'Processing...' : isLoading ? 'Adding...' : 'Add Item'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
