import { X } from 'lucide-react';
import type { OutfitItem } from '../../types';
import { getItemImageUrl } from '../../api';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { AccessoryReplaceGrid } from './AccessoryReplaceGrid';

/**
 * Conflict resolution modal shown when a user tries to add an item
 * to a slot that's already at capacity.
 *
 * Three resolution modes:
 * - **Top replacement**: shows both existing top layers, user picks which to replace
 * - **Accessory replacement**: shows items in both rails, user picks which to evict
 * - **Simple replacement**: single confirm button for bottom/shoes slots
 */
interface ReplaceModalProps {
  accessoryLeftItems: OutfitItem[];
  accessoryRightItems: OutfitItem[];
  canvasTop: OutfitItem[];
  isAccessoryReplacement: boolean;
  isTopReplacement: boolean;
  onCancel: () => void;
  onConfirmReplace: () => void;
  onReplaceAccessory: (slot: 'accessoriesLeft' | 'accessoriesRight', index: number) => void;
  onReplaceTop: (index: number) => void;
  pendingItem: OutfitItem;
}

export function ReplaceModal({
  accessoryLeftItems,
  accessoryRightItems,
  canvasTop,
  isAccessoryReplacement,
  isTopReplacement,
  onCancel,
  onConfirmReplace,
  onReplaceAccessory,
  onReplaceTop,
  pendingItem,
}: ReplaceModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:rgba(17,17,17,0.78)] px-[var(--page-px)] py-6">
      <Card
        className="w-full max-w-lg border-[var(--border-strong)] shadow-[var(--shadow-floating)]"
        padding="md"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-[var(--text-muted)]">Conflict edit</p>
            <h3 className="mt-3 text-2xl font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
              {isTopReplacement
                ? 'Replace a visible layer'
                : isAccessoryReplacement
                  ? 'Choose an accessory to replace'
                  : 'Replace current slot'}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {isTopReplacement
                ? `Two top layers are already active. Choose which one ${pendingItem.name} should replace.`
                : isAccessoryReplacement
                  ? `${pendingItem.name} needs an open accessory position. Choose the piece to remove.`
                  : `${pendingItem.name} will take over the current slot.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-11 w-11 items-center justify-center border border-[var(--border-strong)] bg-[var(--bg-elevated)] text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-inverse)] hover:text-[var(--text-inverse)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
            aria-label="Close replace modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isTopReplacement ? (
          <div className="mt-8 grid gap-3 grid-cols-2">
            {canvasTop.map((topItem, index) => (
              <button
                key={topItem.id}
                type="button"
                onClick={() => onReplaceTop(index)}
                className="group border border-[var(--border)] bg-[var(--bg)] p-4 text-left transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
              >
                <div className="flex h-32 items-center justify-center border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                  {topItem.image_path ? (
                    <img
                      src={getItemImageUrl(topItem.image_path) || ''}
                      alt={topItem.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      No image
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Existing layer {index + 1}
                </p>
                <p className="mt-2 truncate text-sm uppercase tracking-[0.08em] text-[var(--text-primary)]">
                  {topItem.name}
                </p>
              </button>
            ))}
          </div>
        ) : isAccessoryReplacement ? (
          <div className="mt-8 space-y-5">
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Left rail
              </p>
              <AccessoryReplaceGrid
                items={accessoryLeftItems}
                onReplace={(index) => onReplaceAccessory('accessoriesLeft', index)}
              />
            </div>
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Right rail
              </p>
              <AccessoryReplaceGrid
                items={accessoryRightItems}
                onReplace={(index) => onReplaceAccessory('accessoriesRight', index)}
              />
            </div>
            <Button className="w-full" onClick={onCancel} variant="secondary">
              Cancel
            </Button>
          </div>
        ) : (
          <div className="mt-8 flex gap-3">
            <Button className="flex-1" onClick={onCancel} variant="secondary">
              Cancel
            </Button>
            <Button className="flex-1" onClick={onConfirmReplace}>
              Replace item
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
