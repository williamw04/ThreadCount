import type { DragEvent } from 'react';
import { RefreshCcw, X } from 'lucide-react';
import { useOutfitBuilderStore } from '../store';
import { type OutfitSlot } from '../types';
import { getItemImageUrl } from '../api';
import { CanvasActionButton } from './canvas/CanvasActionButton';
import { CanvasEmptyState } from './canvas/CanvasEmptyState';
import { CanvasItemFigure } from './canvas/CanvasItemFigure';
import { CanvasSlotShell } from './canvas/CanvasSlotShell';

/**
 * Outfit canvas — the central composition area where garments are arranged.
 *
 * Renders a fixed 3-column grid: left accessories rail | center column (top/bottom/shoes) | right accessories rail.
 * The center column uses fixed row proportions (30%/50%/20%) to maintain a consistent
 * flatlay layout regardless of how many items are placed.
 *
 * Multi-item slots (top, accessories) render a single active layer at a time,
 * with inactive layers shown at reduced opacity behind the active one.
 * A swap button toggles which layer is visible.
 *
 * Accessories support HTML5 drag-and-drop between left and right rails.
 * The canvas is overflow-hidden to stay within the viewport-locked shell.
 */
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

  const handleDrop = (event: DragEvent, toSlot: 'accessoriesLeft' | 'accessoriesRight') => {
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
        className="h-full"
        heightClassName="h-full"
        isFilled={items.length > 0}
        isSelected={isSelected}
        onClick={() => handleSlotClick('top')}
      >
        {items.length === 0 ? (
          <CanvasEmptyState hint="Layer zone" title="Select tops, dresses, or outerwear" />
        ) : (
          <div className="relative flex h-full items-center justify-center overflow-hidden px-4 pb-4 pt-3">
            {inactiveItem ? (
              <div className="absolute inset-x-0 bottom-4 top-3 flex items-center justify-center px-4">
                <div className="flex h-full w-full max-w-[20rem] items-center justify-center">
                  <CanvasItemFigure
                    alt={inactiveItem.name}
                    imageUrl={getItemImageUrl(inactiveItem.image_path)}
                    muted
                  />
                </div>
              </div>
            ) : null}

            {activeItem ? (
              <div className="relative z-10 flex h-full w-full max-w-[20rem] items-center justify-center">
                <CanvasItemFigure
                  alt={activeItem.name}
                  imageUrl={getItemImageUrl(activeItem.image_path)}
                />
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
        className="h-full"
        heightClassName="h-full"
        isFilled={item !== null}
        isSelected={isSelected}
        onClick={() => handleSlotClick(slot)}
      >
        {item ? (
          <div className="relative flex h-full items-center justify-center overflow-hidden px-4 pb-4 pt-3">
            <div className="relative flex h-full w-full max-w-[24rem] items-center justify-center">
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
            title={
              slot === 'bottom' ? 'Select trousers or bottoms' : 'Select shoes to finish the look'
            }
          />
        )}
      </CanvasSlotShell>
    );
  };

  const renderAccessoriesSlot = (slot: 'accessoriesLeft' | 'accessoriesRight') => {
    const items = slot === 'accessoriesLeft' ? canvas.accessoriesLeft : canvas.accessoriesRight;
    const activeIndex =
      slot === 'accessoriesLeft' ? accessoryLeftLayerIndex : accessoryRightLayerIndex;
    const swapLayer = slot === 'accessoriesLeft' ? swapAccessoryLeftLayer : swapAccessoryRightLayer;
    const isSelected = selectedSlot === slot;

    return (
      <div
        onDrop={(event) => handleDrop(event, slot)}
        onDragOver={handleDragOver}
        className="h-full"
      >
        <CanvasSlotShell
          className="h-full min-h-0"
          heightClassName="h-full"
          isFilled={items.length > 0}
          isSelected={isSelected}
          onClick={() => handleSlotClick(slot)}
        >
          {items.length === 0 ? (
            <CanvasEmptyState
              hint="Accent rail"
              title="Add jewelry, bags, watches, or small details"
            />
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
                    className="absolute left-1/2 flex h-[18%] w-[85%] -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center"
                    style={{ top: position?.top ?? '50%', zIndex: isActive ? 10 : index + 1 }}
                  >
                    <div className="relative flex h-full w-full items-center justify-center bg-[color:rgba(251,251,248,0.42)] px-3 py-2">
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
            </div>
          )}
        </CanvasSlotShell>
      </div>
    );
  };

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      <div className="grid min-h-0 h-full gap-3 p-3 md:grid-cols-[minmax(120px,0.58fr)_minmax(0,1.5fr)_minmax(120px,0.58fr)]">
        {renderAccessoriesSlot('accessoriesLeft')}

        <div className="grid min-h-0 h-full grid-rows-[30%_50%_20%] gap-3">
          {renderTopSlot()}
          {renderSingleSlot('bottom')}
          {renderSingleSlot('shoes')}
        </div>

        {renderAccessoriesSlot('accessoriesRight')}
      </div>
    </section>
  );
}
