import { useState, useRef } from 'react';
import { clsx } from 'clsx';
import { Button } from '@/shared/ui/Button';

interface PhotoUploadProps {
  onPhotoSelected?: (file: File) => void;
  onUpload?: (file: File) => Promise<void>;
  onContinue?: () => void;
  onSkip?: () => void;
}

export function PhotoUpload({ onPhotoSelected, onUpload, onContinue, onSkip }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    onPhotoSelected?.(file);

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
      inputRef.current!.files = dt.files;
      const event = { target: { files: dt.files } } as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(event);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleContinue = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);
    try {
      if (onUpload) {
        await onUpload(selectedFile);
      }
      await onContinue?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2
          className="text-2xl text-[var(--text-primary)] mb-2"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Create Your Avatar
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Upload a full body photo so we can generate AI images of you wearing outfits.
        </p>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] p-6 mb-6">
        <p
          className="text-xs uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-4"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Photo Guidelines
        </p>
        <ul className="text-xs text-[var(--text-secondary)] space-y-2 mb-6">
          <li className="flex items-start gap-2">
            <span className="text-[var(--accent)]">•</span>
            Stand straight with arms at your sides
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--accent)]">•</span>
            Use a neutral background
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--accent)]">•</span>
            Full body must be visible
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--accent)]">•</span>
            Wear form-fitting clothing
          </li>
        </ul>

        {!preview ? (
          <div
            className={clsx(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              'border-[var(--border)] hover:border-[var(--accent)] cursor-pointer',
              error && 'border-[var(--error)]',
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
            {error && <p className="text-xs text-[var(--error)] mt-3">{error}</p>}
          </div>
        ) : (
          <div className="relative">
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-[var(--bg)] mb-4">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[var(--bg-elevated)] shadow-md flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--error)] transition-colors"
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
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button className="flex-1" onClick={handleContinue} disabled={!selectedFile || isUploading}>
          {isUploading ? 'Uploading...' : 'Continue'}
        </Button>
      </div>

      {onSkip && (
        <button
          onClick={onSkip}
          className="w-full mt-3 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          Skip for now — set up later
        </button>
      )}
    </div>
  );
}
