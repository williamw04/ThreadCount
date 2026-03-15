interface CanvasEmptyStateProps {
  hint: string;
  title: string;
}

export function CanvasEmptyState({ hint, title }: CanvasEmptyStateProps) {
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center px-4 py-6 text-center">
      <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--text-muted)]">
        {hint}
      </p>
      <p className="mt-2 max-w-[10rem] text-[12px] uppercase tracking-[0.12em] text-[var(--text-secondary)]">
        {title}
      </p>
    </div>
  );
}
