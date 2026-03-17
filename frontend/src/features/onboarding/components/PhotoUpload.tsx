import { useState, useRef } from 'react';
import { clsx } from 'clsx';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

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
    <div className="w-full space-y-6">
      <div className="space-y-3">
        <p className="eyebrow text-[var(--text-muted)]">Avatar capture</p>
        <h2 className="text-3xl font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)] sm:text-4xl">
          Upload a studio-ready full-body image.
        </h2>
        <p className="max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
          Use a clean pose so the model canvas reads clearly across future outfit generations.
        </p>
      </div>

      <Card padding="lg" className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div className="space-y-4 border border-[var(--border)] bg-[var(--bg)] p-5">
            <p className="eyebrow text-[var(--text-muted)]">Photo guidelines</p>
            <ul className="space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
              <li className="flex items-start gap-2">
                <span className="mt-[7px] h-[6px] w-[6px] bg-[var(--text-primary)]" />
                Stand straight with arms at your sides
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[7px] h-[6px] w-[6px] bg-[var(--text-primary)]" />
                Use a neutral background
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[7px] h-[6px] w-[6px] bg-[var(--text-primary)]" />
                Full body must be visible
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[7px] h-[6px] w-[6px] bg-[var(--text-primary)]" />
                Wear form-fitting clothing
              </li>
            </ul>
          </div>

          {!preview ? (
            <button
              type="button"
              className={clsx(
                'group min-h-[360px] border border-[var(--border)] bg-[linear-gradient(180deg,var(--bg-elevated),var(--bg))] px-6 py-10 text-center transition-all duration-300',
                'hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]',
                error && 'border-[var(--border-strong)]',
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
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] transition-all duration-300 group-hover:border-[var(--border-strong)]">
                <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="eyebrow text-[var(--text-muted)]">Upload portrait</p>
              <p className="mt-4 text-2xl font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
                Drop image or browse archive
              </p>
              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                JPG or PNG. Maximum file size 10MB. Use an uncompromised front-facing shot.
              </p>
              {error ? (
                <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-[var(--text-primary)]">
                  {error}
                </p>
              ) : null}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="relative border border-[var(--border)] bg-[var(--bg)]">
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={preview}
                    alt="Selected avatar preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemove}
                  aria-label="Remove photo"
                  className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] transition-opacity hover:opacity-60"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-between border border-[var(--border)] bg-[var(--bg)] px-4 py-3">
                <span className="eyebrow text-[var(--text-muted)]">Image selected</span>
                <span className="text-sm text-[var(--text-secondary)]">Ready for processing</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="flex gap-3">
        <Button className="flex-1" onClick={handleContinue} disabled={!selectedFile || isUploading}>
          {isUploading ? 'Uploading...' : 'Continue'}
        </Button>
      </div>

      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="w-full text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)] transition-opacity hover:opacity-60"
        >
          Skip for now — set up later
        </button>
      )}
    </div>
  );
}
