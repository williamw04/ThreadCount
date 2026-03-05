import { useOutfitBuilderStore } from '../store';
import { type OutfitSlot } from '../types';
import { getItemImageUrl } from '../api';

export function OutfitCanvas() {
  const { canvas, setSelectedSlot, selectedSlot, removeFromSlot, topLayerIndex, swapTopLayer } = useOutfitBuilderStore();

  const handleSlotClick = (slot: OutfitSlot) => {
    setSelectedSlot(slot);
  };

  const renderTopSlot = () => {
    const isSelected = selectedSlot === 'top';
    const items = canvas.top;
    const showSwap = items.length > 1;
    const activeItem = items[topLayerIndex];
    const inactiveItem = items[topLayerIndex === 0 ? 1 : 0];

    return (
      <div
        onClick={() => handleSlotClick('top')}
        className={`
          relative flex items-center justify-center flex-1
          transition-all duration-200 cursor-pointer
        `}
      >
        {items.length === 0 ? (
          <div className={`w-full h-full flex items-center justify-center ${isSelected ? 'bg-[var(--color-primary)]/10' : ''}`} />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {inactiveItem && (
              <div
                className="absolute h-full flex items-center justify-center p-2 opacity-30"
                style={{ width: '45%', left: 'calc(50%)', transform: 'translateX(-50%)', zIndex: 0 }}
              >
                <img
                  src={getItemImageUrl(inactiveItem.image_path) || ''}
                  alt={inactiveItem.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            {activeItem && (
              <div
                className="absolute h-full flex items-center justify-center p-2"
                style={{ width: '45%', left: 'calc(50%)', transform: 'translateX(-50%)', zIndex: 1 }}
              >
                <img
                  src={getItemImageUrl(activeItem.image_path) || ''}
                  alt={activeItem.name}
                  className={`max-w-full max-h-full object-contain transition-all duration-200 ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2' : ''}`}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromSlot('top', topLayerIndex);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 opacity-0 hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
            {showSwap && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  swapTopLayer();
                }}
                className="absolute bottom-2 right-2 p-2 rounded-full bg-gray-800/70 text-white hover:bg-gray-700 transition-colors z-10"
                title="Swap layer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSlot = (slot: 'bottom' | 'shoes') => {
    const item = canvas[slot];
    const isSelected = selectedSlot === slot;
    const imageUrl = item ? getItemImageUrl(item.image_path) : null;

    return (
      <div
        onClick={() => handleSlotClick(slot)}
        className={`
          relative flex items-center justify-center
          transition-all duration-200 cursor-pointer
        `}
        style={{ height: slot === 'bottom' ? '45%' : '20%' }}
      >
        {imageUrl ? (
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              src={imageUrl}
              alt={item?.name || ''}
              className={`max-w-full max-h-full object-contain transition-all duration-200 ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2' : ''}`}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFromSlot(slot);
              }}
              className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 opacity-0 hover:opacity-100 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isSelected ? 'bg-[var(--color-primary)]/10' : ''}`} />
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {renderTopSlot()}
      {renderSlot('bottom')}
      {renderSlot('shoes')}
    </div>
  );
}
