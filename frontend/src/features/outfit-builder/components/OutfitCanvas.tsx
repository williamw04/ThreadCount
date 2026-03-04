import { useOutfitBuilderStore } from '../store';
import { type OutfitSlot } from '../types';
import { getItemImageUrl } from '../api';

export function OutfitCanvas() {
  const { canvas, setSelectedSlot, selectedSlot, setCanvasItem } = useOutfitBuilderStore();

  const handleSlotClick = (slot: OutfitSlot) => {
    setSelectedSlot(slot);
  };

  const handleRemoveItem = (slot: OutfitSlot, e: React.MouseEvent) => {
    e.stopPropagation();
    setCanvasItem(slot, null);
  };

  const clothingSlots: OutfitSlot[] = ['base', 'outer', 'bottom', 'shoes'];
  const accessorySlots: OutfitSlot[] = ['accessory'];

  const renderSlot = (slot: OutfitSlot, isAccessory = false) => {
    const item = canvas[slot];
    const isSelected = selectedSlot === slot;
    const imageUrl = item ? getItemImageUrl(item.image_path) : null;

    if (isAccessory) {
      return (
        <div
          key={slot}
          onClick={() => handleSlotClick(slot)}
          className={`
            relative flex-1 flex items-center justify-center
            transition-all duration-200 cursor-pointer
            ${isSelected ? 'ring-2 ring-[var(--color-primary)] ring-offset-2' : ''}
          `}
        >
          {imageUrl ? (
            <div className="relative w-full h-full p-1">
              <img
                src={imageUrl}
                alt={item?.name || ''}
                className="w-full h-full object-contain"
              />
              <button
                onClick={(e) => handleRemoveItem(slot, e)}
                className="absolute top-0 right-0 p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${isSelected ? 'bg-[var(--color-primary)]/10' : ''}`}>
              <span className="text-2xl opacity-30">+</span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={slot}
        onClick={() => handleSlotClick(slot)}
        className={`
          relative flex-1 flex items-center justify-center
          transition-all duration-200 cursor-pointer
          ${isSelected ? 'ring-2 ring-[var(--color-primary)] ring-offset-2' : ''}
        `}
      >
        {imageUrl ? (
          <div className="relative w-full h-full p-1">
            <img
              src={imageUrl}
              alt={item?.name || ''}
              className="w-full h-full object-contain"
            />
            <button
              onClick={(e) => handleRemoveItem(slot, e)}
              className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isSelected ? 'bg-[var(--color-primary)]/10' : ''}`}>
            <span className="text-2xl opacity-30">
              {slot === 'base' && '👕'}
              {slot === 'outer' && '🧥'}
              {slot === 'bottom' && '👖'}
              {slot === 'shoes' && '👟'}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full bg-transparent flex">
      <div className="absolute left-0 top-0 bottom-0 w-[55%] flex flex-col gap-1">
        {clothingSlots.map((slot) => renderSlot(slot))}
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-[42%] flex flex-col gap-1">
        {accessorySlots.map((slot) => renderSlot(slot, true))}
      </div>
    </div>
  );
}
