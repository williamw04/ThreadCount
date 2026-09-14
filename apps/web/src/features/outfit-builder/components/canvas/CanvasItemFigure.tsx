import { clsx } from 'clsx';

/**
 * Renders a single garment image on the canvas.
 * The `muted` prop applies reduced opacity and slight grayscale to
 * inactive layers in multi-item slots, creating a visual depth effect.
 * Images use `object-contain` to preserve aspect ratio within the slot.
 */
interface CanvasItemFigureProps {
  alt: string;
  className?: string;
  imageUrl: string | null;
  muted?: boolean;
}

export function CanvasItemFigure({
  alt,
  className,
  imageUrl,
  muted = false,
}: CanvasItemFigureProps) {
  if (!imageUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center border border-dashed border-[var(--border)] bg-[var(--bg)] text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
        No image
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={clsx(
        'max-h-full max-w-full object-contain transition-all duration-200',
        'outfit-figure h-auto w-auto',
        muted ? 'opacity-35 grayscale-[0.2]' : '',
        className,
      )}
    />
  );
}
