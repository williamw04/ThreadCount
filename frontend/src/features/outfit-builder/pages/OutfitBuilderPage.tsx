import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Plus, RefreshCcw, Save } from 'lucide-react';
import { useOutfitBuilderStore } from '../store';
import { useWardrobeStore } from '@/features/wardrobe/store';
import { OutfitCanvas } from '../components/OutfitCanvas';
import { WardrobePanel } from '../components/WardrobePanel';
import { BuilderMetric } from '../components/builder/BuilderMetric';
import { SaveOutfitModal } from '../components/builder/SaveOutfitModal';
import { SavedLooksPanel } from '../components/builder/SavedLooksPanel';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { SurfaceMessage } from '@/shared/ui/SurfaceMessage';

export function OutfitBuilderPage() {
  const {
    clearCanvas,
    clearError,
    currentOutfit,
    error,
    fetchOutfits,
    isLoading,
    loadOutfit,
    outfits,
    saveOutfit,
  } = useOutfitBuilderStore();
  const { fetchItems, items: wardrobeItems, isLoading: isWardrobeLoading } = useWardrobeStore();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    void fetchItems();
    void fetchOutfits();
  }, [fetchItems, fetchOutfits]);

  useEffect(() => {
    if (!saveState || saveState !== 'saved') {
      return;
    }

    const timer = window.setTimeout(() => setSaveState('idle'), 2400);
    return () => window.clearTimeout(timer);
  }, [saveState]);

  const canvas = useOutfitBuilderStore((state) => state.canvas);
  const hasItems = useMemo(
    () =>
      canvas.top.length > 0 ||
      canvas.bottom !== null ||
      canvas.shoes !== null ||
      canvas.accessoriesLeft.length > 0 ||
      canvas.accessoriesRight.length > 0,
    [canvas],
  );

  const totalCanvasItems =
    canvas.top.length +
    (canvas.bottom ? 1 : 0) +
    (canvas.shoes ? 1 : 0) +
    canvas.accessoriesLeft.length +
    canvas.accessoriesRight.length;

  const isBootstrapping =
    (isLoading && outfits.length === 0) || (isWardrobeLoading && wardrobeItems.length === 0);
  const isRefreshDisabled = isLoading || isWardrobeLoading;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveState('idle');

    try {
      await saveOutfit(outfitName.trim() || 'Untitled Outfit');
      setShowSaveModal(false);
      setOutfitName('');
      setSaveState('saved');
    } catch {
      // store handles error state
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewOutfit = () => {
    clearCanvas();
    setSaveState('idle');
    setOutfitName('');
  };

  const handleReload = () => {
    clearError();
    void fetchItems();
    void fetchOutfits();
  };

  return (
    <div className="builder-shell page-enter bg-[var(--bg)]">
      <section className="builder-canvas-row px-[var(--page-px)] pt-5 pb-5">
        <div className="grid h-full min-h-0 grid-cols-[minmax(240px,0.7fr)_minmax(0,1.5fr)_minmax(260px,0.82fr)] gap-5 overflow-hidden">
          <div className="min-h-0 overflow-hidden">
            <SavedLooksPanel
              isBootstrapping={isBootstrapping}
              isRefreshDisabled={isRefreshDisabled}
              onDelete={(outfitId) => void useOutfitBuilderStore.getState().deleteOutfit(outfitId)}
              onLoad={(selectedOutfit) => void loadOutfit(selectedOutfit)}
              onRefresh={handleReload}
              outfits={outfits}
              saveState={saveState}
            />
          </div>

          <Card
            className="flex min-h-0 flex-col overflow-hidden border-[var(--border-strong)]"
            padding="none"
          >
            <div className="flex flex-none items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
              <div className="min-w-0">
                <p className="eyebrow text-[var(--text-muted)]">Outfit atelier</p>
                <h1 className="mt-2 text-[clamp(1.45rem,1.8vw,2.5rem)] font-semibold uppercase leading-none tracking-[0.08em] text-[var(--text-primary)]">
                  Outfit Builder
                </h1>
                <p className="mt-2 max-w-2xl text-[13px] leading-5 text-[var(--text-secondary)]">
                  Compose silhouettes, stack layers, and keep the entire canvas visible inside a
                  locked viewport studio.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                <span className="border border-[var(--border)] px-2.5 py-1.5">
                  {currentOutfit
                    ? `Editing ${currentOutfit.name || 'untitled look'}`
                    : 'New composition'}
                </span>
                <span className="border border-[var(--border)] px-2.5 py-1.5">
                  {hasItems ? 'Canvas populated' : 'Canvas empty'}
                </span>
              </div>
            </div>

            {error ? (
              <div
                className="flex flex-none items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-3 text-sm text-[var(--text-primary)]"
                role="alert"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={clearError} size="sm" variant="ghost">
                    Dismiss
                  </Button>
                  <Button onClick={handleReload} size="sm" variant="secondary">
                    <RefreshCcw className="h-4 w-4" />
                    Retry
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="flex flex-none gap-3 border-b border-[var(--border)] px-5 py-3">
              <BuilderMetric
                label="Active items"
                value={String(totalCanvasItems).padStart(2, '0')}
              />
              <BuilderMetric label="Saved looks" value={String(outfits.length).padStart(2, '0')} />
              <BuilderMetric
                label="Wardrobe ready"
                value={String(wardrobeItems.length).padStart(2, '0')}
              />
            </div>

            <div className="canvas-area min-h-0 flex-1 overflow-hidden p-3">
              {isBootstrapping ? (
                <SurfaceMessage
                  className="flex h-full min-h-0 items-center justify-center"
                  description="Loading wardrobe pieces and saved looks into the builder studio."
                  kicker="Loading"
                  title="Preparing atelier"
                />
              ) : (
                <OutfitCanvas />
              )}
            </div>
          </Card>

          <div className="min-h-0 overflow-hidden">
            <WardrobePanel />
          </div>
        </div>
      </section>

      <div className="builder-controls flex items-center justify-between gap-6 px-[var(--page-px)]">
        <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
          <span>
            {hasItems
              ? `${totalCanvasItems} item${totalCanvasItems === 1 ? '' : 's'} active`
              : 'Canvas empty'}
          </span>
          <span>{currentOutfit ? 'Edit mode' : 'Draft mode'}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleNewOutfit} size="sm" variant="secondary">
            <Plus className="h-4 w-4" />
            New look
          </Button>
          <Button disabled={!hasItems || isSaving} onClick={() => setShowSaveModal(true)} size="sm">
            <Save className="h-4 w-4" />
            Save look
          </Button>
        </div>
      </div>

      {showSaveModal ? (
        <SaveOutfitModal
          isSaving={isSaving}
          name={outfitName}
          onChange={setOutfitName}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSave}
        />
      ) : null}
    </div>
  );
}
