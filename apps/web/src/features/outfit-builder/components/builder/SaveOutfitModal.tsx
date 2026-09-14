import { LoaderCircle, Save, X } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';

/**
 * Modal for naming and saving the current outfit composition.
 * Shown from the "Save look" button in the builder controls row.
 * The name is optional — defaults to "Untitled Outfit" if left blank.
 */
interface SaveOutfitModalProps {
  isSaving: boolean;
  name: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export function SaveOutfitModal({
  isSaving,
  name,
  onChange,
  onClose,
  onSave,
}: SaveOutfitModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:rgba(17,17,17,0.78)] px-[var(--page-px)] py-6">
      <Card
        className="w-full max-w-md border-[var(--border-strong)] shadow-[var(--shadow-floating)]"
        padding="md"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-[var(--text-muted)]">Wardrobe outfit</p>
            <h2 className="mt-3 text-2xl font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
              Save current composition
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Preserve this build inside the monochrome wardrobe and return to it later.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center border border-[var(--border-strong)] bg-[var(--bg-elevated)] text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-inverse)] hover:text-[var(--text-inverse)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
            aria-label="Close save outfit modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 space-y-5">
          <Input
            autoFocus
            className="border-[var(--border-strong)] bg-[var(--bg)]"
            label="Outfit title"
            maxLength={80}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Gallery look 01"
            value={name}
          />
          <div className="flex gap-3">
            <Button className="flex-1" onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button className="flex-1" disabled={isSaving} onClick={onSave}>
              {isSaving ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save outfit
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
