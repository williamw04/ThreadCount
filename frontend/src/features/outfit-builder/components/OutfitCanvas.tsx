import type { DragEvent } from 'react';
import { MoveHorizontal, RefreshCcw, X } from 'lucide-react';
import { useOutfitBuilderStore } from '../store';
import { type OutfitSlot, SLOT_LABELS } from '../types';
import { getItemImageUrl } from '../api';
import { CanvasActionButton } from './canvas/CanvasActionButton';
import { CanvasEmptyState } from './canvas/CanvasEmptyState';
import { CanvasItemFigure } from './canvas/CanvasItemFigure';
import { CanvasSlotShell } from './canvas/CanvasSlotShell';

function getAccessoryPosition(index: number) {
  const positions = [
    { left: '50%', top: '16%' },
    { left: '50%', top: '33%' },
    { left: '50%', top: '50%' },
    { left: '50%', top: '67%' },
    { left: '50%', top: '84%' },
  ];

  return positions[index % positions.length];
}

export function OutfitCanvas() {
  const {
    accessoryLeftLayerIndex,
    accessoryRightLayerIndex,
    canvas,
    moveAccessory,
    removeFromSlot,
    selectedSlot,
    setSelectedSlot,
    swapAccessoryLeftLayer,
    swapAccessoryRightLayer,
    swapTopLayer,
    topLayerIndex,
  } = useOutfitBuilderStore();

  const totalAccessories = canvas.accessoriesLeft.length + canvas.accessoriesRight.length;

  const handleSlotClick = (slot: OutfitSlot) => {
    setSelectedSlot(slot);
  };

  const handleDragStart = (
    event: DragEvent,
    slot: 'accessoriesLeft' | 'accessoriesRight',
    index: number,
  ) => {
    event.dataTransfer.setData('slot', slot);
    event.dataTransfer.setData('index', String(index));
  };

  const handleDrop = (
    event: DragEvent,
    toSlot: 'accessoriesLeft' | 'accessoriesRight',
  ) => {
    event.preventDefault();
    const fromSlot = event.dataTransfer.getData('slot') as 'accessoriesLeft' | 'accessoriesRight';
    const fromIndex = Number.parseInt(event.dataTransfer.getData('index'), 10);

    if (!Number.isNaN(fromIndex) && fromSlot !== toSlot) {
      moveAccessory(fromSlot, toSlot, fromIndex);
    }
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
  };

  const renderTopSlot = () => {
    const items = canvas.top;
    const activeItem = items[topLayerIndex];
    const inactiveItem = items[topLayerIndex === 0 ? 1 : 0] ?? null;
    const isSelected = selectedSlot === 'top';

    return (
      <CanvasSlotShell
        className="min-h-0 flex-1"
        heightClassName="h-full"
        isFilled={items.length > 0}
        isSelected={isSelected}
        label={SLOT_LABELS.top}
        meta={items.length > 1 ? `${items.length} layers` : items.length === 1 ? '1 layer' : 'Empty'}
        onClick={() => handleSlotClick('top')}
      >
        {items.length === 0 ? (
          <CanvasEmptyState hint="Layer zone" title="Select tops, dresses, or outerwear" />
        ) : (
          <div className="relative flex h-full items-center justify-center overflow-hidden px-4 pb-4 pt-3">
            {inactiveItem ? (
              <div className="absolute inset-x-0 bottom-4 top-3 flex items-center justify-center px-4">
                <div className="flex h-full w-full max-w-[14rem] items-center justify-center">
                  <CanvasItemFigure
                    alt={inactiveItem.name}
                    imageUrl={getItemImageUrl(inactiveItem.image_path)}
                    muted
                  />
                </div>
              </div>
            ) : null}

            {activeItem ? (
              <div className="relative z-10 flex h-full w-full max-w-[14rem] items-center justify-center">
                <CanvasItemFigure alt={activeItem.name} imageUrl={getItemImageUrl(activeItem.image_path)} />
                <CanvasActionButton
                  aria-label={`Remove ${activeItem.name}`}
                  className="absolute right-0 top-0"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeFromSlot('top', topLayerIndex);
                  }}
                >
                  <X className="h-4 w-4" />
                </CanvasActionButton>
              </div>
            ) : null}

            {items.length > 1 ? (
              <CanvasActionButton
                aria-label="Swap top layer"
                className="absolute bottom-3 right-3 z-20"
                onClick={(event) => {
                  event.stopPropagation();
                  swapTopLayer();
                }}
                title="Swap top layer"
              >
                <RefreshCcw className="h-4 w-4" />
              </CanvasActionButton>
            ) : null}
          </div>
        )}
      </CanvasSlotShell>
    );
  };

  const renderSingleSlot = (slot: 'bottom' | 'shoes') => {
    const item = canvas[slot];
    const isSelected = selectedSlot === slot;

    return (
      <CanvasSlotShell
        className="min-h-0"
        heightClassName="h-full"
        isFilled={item !== null}
        isSelected={isSelected}
        label={SLOT_LABELS[slot]}
        meta={item ? item.name : 'Empty'}
        onClick={() => handleSlotClick(slot)}
      >
        {item ? (
          <div className="relative flex h-full items-center justify-center overflow-hidden px-4 pb-4 pt-3">
            <div className="relative flex h-full w-full max-w-[11rem] items-center justify-center">
              <CanvasItemFigure alt={item.name} imageUrl={getItemImageUrl(item.image_path)} />
              <CanvasActionButton
                aria-label={`Remove ${item.name}`}
                className="absolute right-0 top-0"
                onClick={(event) => {
                  event.stopPropagation();
                  removeFromSlot(slot);
                }}
              >
                <X className="h-4 w-4" />
              </CanvasActionButton>
            </div>
          </div>
        ) : (
          <CanvasEmptyState
            hint={slot === 'bottom' ? 'Foundation zone' : 'Footing zone'}
            title={slot === 'bottom' ? 'Select trousers or bottoms' : 'Select shoes to finish the look'}
          />
        )}
      </CanvasSlotShell>
    );
  };

  const renderAccessoriesSlot = (slot: 'accessoriesLeft' | 'accessoriesRight') => {
    const items = slot === 'accessoriesLeft' ? canvas.accessoriesLeft : canvas.accessoriesRight;
    const activeIndex = slot === 'accessoriesLeft' ? accessoryLeftLayerIndex : accessoryRightLayerIndex;
    const swapLayer = slot === 'accessoriesLeft' ? swapAccessoryLeftLayer : swapAccessoryRightLayer;
    const isSelected = selectedSlot === slot;

    return (
      <div onDrop={(event) => handleDrop(event, slot)} onDragOver={handleDragOver} className="h-full">
        <CanvasSlotShell
          className="h-full min-h-0"
          heightClassName="h-full"
          isFilled={items.length > 0}
          isSelected={isSelected}
          label={SLOT_LABELS[slot]}
          meta={items.length > 0 ? `${items.length} active` : 'Drop accessories'}
          onClick={() => handleSlotClick(slot)}
        >
          {items.length === 0 ? (
            <CanvasEmptyState hint="Accent rail" title="Add jewelry, bags, watches, or small details" />
          ) : (
            <div className="relative h-full overflow-hidden pb-4 pt-3">
              {items.map((item, index) => {
                const position = getAccessoryPosition(index);
                const isActive = index === activeIndex;

                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(event) => handleDragStart(event, slot, index)}
                    className="absolute left-1/2 flex h-[12%] w-[72%] -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center"
                    style={{ top: position?.top ?? '50%', zIndex: isActive ? 10 : index + 1 }}
                  >
                    <div className="relative flex h-full w-full items-center justify-center border border-[var(--border)] bg-[color:rgba(251,251,248,0.78)] px-3 py-2">
                      <CanvasItemFigure
                        alt={item.name}
                        className={isActive ? '' : 'scale-[0.95]'}
                        imageUrl={getItemImageUrl(item.image_path)}
                        muted={!isActive}
                      />
                      <CanvasActionButton
                        aria-label={`Remove ${item.name}`}
                        className="absolute -right-1 -top-1"
                        compact
                        onClick={(event) => {
                          event.stopPropagation();
                          removeFromSlot(slot, index);
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </CanvasActionButton>
                    </div>
                  </div>
                );
              })}

              {items.length > 1 ? (
                <CanvasActionButton
                  aria-label={`Swap ${slot === 'accessoriesLeft' ? 'left' : 'right'} accessory layer`}
                  className="absolute bottom-3 right-3 z-20"
                  onClick={(event) => {
                    event.stopPropagation();
                    swapLayer();
                  }}
                  title="Swap accessory layer"
                >
                  <RefreshCcw className="h-4 w-4" />
                </CanvasActionButton>
              ) : null}

              <div className="absolute bottom-3 left-3 flex items-center gap-2 border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-[9px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
                <MoveHorizontal className="h-3.5 w-3.5" />
                Drag across rails
              </div>
            </div>
          )}
        </CanvasSlotShell>
      </div>
    );
  };

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden border border-[var(--border)] bg-[linear-gradient(180deg,rgba(251,251,248,0.95)_0%,rgba(244,244,239,0.96)_100%)]">
      <div className="flex flex-none items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-3">
        <div>
          <p className="eyebrow text-[var(--text-muted)]">Composition board</p>
          <p className="mt-1 text-[13px] leading-5 text-[var(--text-secondary)]">
            Click a zone to focus the wardrobe rail. Swap layers where stacking is available.
          </p>
        </div>
        <div className="border border-[var(--border)] px-2.5 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
          {totalAccessories} accessories live
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 p-3 md:grid-cols-[minmax(120px,0.58fr)_minmax(0,1.5fr)_minmax(120px,0.58fr)]">
        {renderAccessoriesSlot('accessoriesLeft')}

        <div className="grid min-h-0 grid-rows-[1.15fr_0.72fr_0.48fr] gap-3">
          {renderTopSlot()}
          {renderSingleSlot('bottom')}
          {renderSingleSlot('shoes')}
        </div>

        {renderAccessoriesSlot('accessoriesRight')}
      </div>
    </section>
  );
}
