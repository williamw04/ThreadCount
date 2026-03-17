import { Check, RefreshCcw } from 'lucide-react';
import type { Outfit } from '../../types';
import { OutfitCard } from '../OutfitCard';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { SurfaceMessage } from '@/shared/ui/SurfaceMessage';

interface SavedLooksPanelProps {
  isBootstrapping: boolean;
  isRefreshDisabled: boolean;
  onDelete: (outfitId: string) => void;
  onLoad: (outfit: Outfit) => void;
  onRefresh: () => void;
  outfits: Outfit[];
  saveState: 'idle' | 'saved';
}

export function SavedLooksPanel({
  isBootstrapping,
  isRefreshDisabled,
  onDelete,
  onLoad,
  onRefresh,
  outfits,
  saveState,
}: SavedLooksPanelProps) {
  return (
    <Card className="flex h-full min-h-0 flex-col border-[var(--border-strong)]" padding="sm">
      <div className="flex flex-none items-start justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div>
          <p className="eyebrow text-[var(--text-muted)]">Saved archive</p>
          <h2 className="mt-2 text-lg font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
            Return to prior looks
          </h2>
        </div>
        <Button disabled={isRefreshDisabled} onClick={onRefresh} size="sm" variant="ghost">
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {saveState === 'saved' ? (
        <div className="mt-3 flex flex-none items-center gap-2 border border-[var(--border-strong)] bg-[var(--bg)] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--text-primary)]">
          <Check className="h-4 w-4" />
          Outfit saved to archive
        </div>
      ) : null}

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
        {isBootstrapping ? (
          <SurfaceMessage
            className="px-4 py-6"
            description="Collecting saved compositions from the archive."
            kicker="Loading"
            title="Syncing saved looks"
          />
        ) : outfits.length === 0 ? (
          <SurfaceMessage
            className="px-4 py-6"
            description="The archive is empty. Save the current composition to build a reusable outfit catalog."
            kicker="No saved looks"
            title="Start the archive"
          />
        ) : (
          <div className="grid gap-4">
            {outfits.map((outfit) => (
              <OutfitCard key={outfit.id} onDelete={onDelete} onSelect={onLoad} outfit={outfit} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
