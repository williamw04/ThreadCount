import { useOutfitBuilderStore } from '../store';
import { type OutfitSlot } from '../types';
import { getItemImageUrl } from '../api';

export function OutfitCanvas() {
  const { canvas, setSelectedSlot, selectedSlot, removeFromSlot } = useOutfitBuilderStore();

  const handleSlotClick = (slot: OutfitSlot) => {
    setSelectedSlot(slot);
  };

  const renderTopSlot = () => {
    const isSelected = selectedSlot === 'top';
    const items = canvas.top;

    return (
      <div
        onClick={() => handleSlotClick('top')}
        className={`
          relative flex items-center justify-center flex-1
          transition-all duration-200 cursor-pointer
          ${isSelected ? 'ring-2 ring-[var(--color-primary)] ring-offset-2' : ''}
        `}
      >
        {items.length > 0 ? (
          <div className="relative w-full h-full">
            {items.map((item, index) => {
              const imageUrl = getItemImageUrl(item.image_path);
              if (!imageUrl) return null;
              return (
                <div
                  key={item.id}
                  className="absolute inset-0 flex items-center justify-center p-4"
                  style={{ zIndex: index }}
                >
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromSlot('top', index);
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isSelected ? 'bg-[var(--color-primary)]/10' : ''}`} />
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
          ${isSelected ? 'ring-2 ring-[var(--color-primary)] ring-offset-2' : ''}
        `}
        style={{ height: slot === 'bottom' ? '45%' : '20%' }}
      >
        {imageUrl ? (
          <div className="relative w-full h-full p-4">
            <img
              src={imageUrl}
              alt={item?.name || ''}
              className="w-full h-full object-contain"
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
