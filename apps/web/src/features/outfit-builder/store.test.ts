/**
 * Unit tests for the outfit builder store.
 *
 * Tests focus on canvas manipulation logic (add, remove, swap, clear)
 * which is the most complex state management in the feature.
 * The store is tested by directly calling actions on the singleton
 * and asserting against `getState()` — no rendering required.
 *
 * Supabase is mocked globally since store actions that interact with
 * the backend (saveOutfit, loadOutfit, etc.) are not tested here.
 */
import { useOutfitBuilderStore } from './store';
import type { OutfitItem } from './types';
import type { Category } from '@/features/wardrobe/types';

vi.mock('@/shared/api/supabase');

const createMockItem = (id: string, name: string, category: Category): OutfitItem => ({
  id,
  name,
  category,
  image_path: `test/${id}.png`,
});

describe('OutfitBuilderStore', () => {
  beforeEach(() => {
    useOutfitBuilderStore.setState({
      canvas: { top: [], bottom: null, shoes: null, accessoriesLeft: [], accessoriesRight: [] },
      selectedSlot: null,
      topLayerIndex: 0,
      accessoryLeftLayerIndex: 0,
      accessoryRightLayerIndex: 0,
      currentOutfit: null,
      outfits: [],
      isLoading: false,
      error: null,
    });
  });

  describe('addToSlot', () => {
    it('adds item to top slot', () => {
      const store = useOutfitBuilderStore.getState();
      const shirt = createMockItem('1', 'Shirt', 'tops');

      store.addToSlot('top', shirt);

      const state = useOutfitBuilderStore.getState();
      expect(state.canvas.top).toHaveLength(1);
      expect(state.canvas.top[0]?.name).toBe('Shirt');
    });

    it('adds multiple items to top slot', () => {
      const store = useOutfitBuilderStore.getState();
      const shirt = createMockItem('1', 'Shirt', 'tops');
      const jacket = createMockItem('2', 'Jacket', 'outerwear');

      store.addToSlot('top', shirt);
      store.addToSlot('top', jacket);

      expect(useOutfitBuilderStore.getState().canvas.top).toHaveLength(2);
    });

    it('adds item to bottom slot', () => {
      const store = useOutfitBuilderStore.getState();
      const pants = createMockItem('3', 'Pants', 'bottoms');

      store.addToSlot('bottom', pants);

      expect(useOutfitBuilderStore.getState().canvas.bottom).not.toBeNull();
      expect(useOutfitBuilderStore.getState().canvas.bottom?.name).toBe('Pants');
    });

    it('adds item to shoes slot', () => {
      const store = useOutfitBuilderStore.getState();
      const shoes = createMockItem('4', 'Sneakers', 'shoes');

      store.addToSlot('shoes', shoes);

      expect(useOutfitBuilderStore.getState().canvas.shoes).not.toBeNull();
      expect(useOutfitBuilderStore.getState().canvas.shoes?.name).toBe('Sneakers');
    });

    it('clears selectedSlot after adding item', () => {
      const store = useOutfitBuilderStore.getState();
      useOutfitBuilderStore.setState({ selectedSlot: 'top' });
      const shirt = createMockItem('1', 'Shirt', 'tops');

      store.addToSlot('top', shirt);

      expect(useOutfitBuilderStore.getState().selectedSlot).toBeNull();
    });

    it('resets topLayerIndex to 0 when adding to top', () => {
      const store = useOutfitBuilderStore.getState();
      const shirt = createMockItem('1', 'Shirt', 'tops');
      const jacket = createMockItem('2', 'Jacket', 'outerwear');

      store.addToSlot('top', shirt);
      store.addToSlot('top', jacket);
      store.swapTopLayer();

      expect(useOutfitBuilderStore.getState().topLayerIndex).toBe(1);

      store.addToSlot('top', createMockItem('3', 'Tank Top', 'tops'));

      expect(useOutfitBuilderStore.getState().topLayerIndex).toBe(0);
    });
  });

  describe('removeFromSlot', () => {
    it('removes item from top slot by index', () => {
      const store = useOutfitBuilderStore.getState();
      const shirt = createMockItem('1', 'Shirt', 'tops');
      const jacket = createMockItem('2', 'Jacket', 'outerwear');

      store.addToSlot('top', shirt);
      store.addToSlot('top', jacket);
      store.removeFromSlot('top', 0);

      expect(useOutfitBuilderStore.getState().canvas.top).toHaveLength(1);
      expect(useOutfitBuilderStore.getState().canvas.top[0]?.name).toBe('Jacket');
    });

    it('removes item from bottom slot', () => {
      const store = useOutfitBuilderStore.getState();
      const pants = createMockItem('3', 'Pants', 'bottoms');

      store.addToSlot('bottom', pants);
      store.removeFromSlot('bottom');

      expect(useOutfitBuilderStore.getState().canvas.bottom).toBeNull();
    });

    it('removes item from shoes slot', () => {
      const store = useOutfitBuilderStore.getState();
      const shoes = createMockItem('4', 'Sneakers', 'shoes');

      store.addToSlot('shoes', shoes);
      store.removeFromSlot('shoes');

      expect(useOutfitBuilderStore.getState().canvas.shoes).toBeNull();
    });

    it('resets topLayerIndex to 0 when removing from top', () => {
      const store = useOutfitBuilderStore.getState();
      const shirt = createMockItem('1', 'Shirt', 'tops');
      const jacket = createMockItem('2', 'Jacket', 'outerwear');

      store.addToSlot('top', shirt);
      store.addToSlot('top', jacket);
      store.swapTopLayer();
      store.removeFromSlot('top', 0);

      expect(useOutfitBuilderStore.getState().topLayerIndex).toBe(0);
    });
  });

  describe('swapTopLayer', () => {
    it('toggles topLayerIndex between 0 and 1', () => {
      const store = useOutfitBuilderStore.getState();
      const shirt = createMockItem('1', 'Shirt', 'tops');
      const jacket = createMockItem('2', 'Jacket', 'outerwear');

      store.addToSlot('top', shirt);
      store.addToSlot('top', jacket);

      expect(useOutfitBuilderStore.getState().topLayerIndex).toBe(0);

      store.swapTopLayer();
      expect(useOutfitBuilderStore.getState().topLayerIndex).toBe(1);

      store.swapTopLayer();
      expect(useOutfitBuilderStore.getState().topLayerIndex).toBe(0);
    });

    it('does nothing when there is only one item in top', () => {
      const store = useOutfitBuilderStore.getState();
      const shirt = createMockItem('1', 'Shirt', 'tops');

      store.addToSlot('top', shirt);
      store.swapTopLayer();

      expect(useOutfitBuilderStore.getState().topLayerIndex).toBe(0);
    });

    it('does nothing when top is empty', () => {
      const store = useOutfitBuilderStore.getState();

      store.swapTopLayer();

      expect(useOutfitBuilderStore.getState().topLayerIndex).toBe(0);
    });
  });

  describe('setSelectedSlot', () => {
    it('sets the selected slot', () => {
      const store = useOutfitBuilderStore.getState();

      store.setSelectedSlot('top');
      expect(useOutfitBuilderStore.getState().selectedSlot).toBe('top');

      store.setSelectedSlot('bottom');
      expect(useOutfitBuilderStore.getState().selectedSlot).toBe('bottom');

      store.setSelectedSlot(null);
      expect(useOutfitBuilderStore.getState().selectedSlot).toBeNull();
    });
  });

  describe('clearCanvas', () => {
    it('clears all slots', () => {
      const store = useOutfitBuilderStore.getState();
      const shirt = createMockItem('1', 'Shirt', 'tops');
      const pants = createMockItem('2', 'Pants', 'bottoms');
      const shoes = createMockItem('3', 'Sneakers', 'shoes');

      store.addToSlot('top', shirt);
      store.addToSlot('bottom', pants);
      store.addToSlot('shoes', shoes);
      store.clearCanvas();

      expect(useOutfitBuilderStore.getState().canvas.top).toHaveLength(0);
      expect(useOutfitBuilderStore.getState().canvas.bottom).toBeNull();
      expect(useOutfitBuilderStore.getState().canvas.shoes).toBeNull();
    });

    it('resets topLayerIndex to 0', () => {
      const store = useOutfitBuilderStore.getState();
      const shirt = createMockItem('1', 'Shirt', 'tops');
      const jacket = createMockItem('2', 'Jacket', 'outerwear');

      store.addToSlot('top', shirt);
      store.addToSlot('top', jacket);
      store.swapTopLayer();
      store.clearCanvas();

      expect(useOutfitBuilderStore.getState().topLayerIndex).toBe(0);
    });
  });

  describe('setCanvasItem', () => {
    it('replaces top slot with single item', () => {
      const store = useOutfitBuilderStore.getState();
      const shirt = createMockItem('1', 'Shirt', 'tops');
      const jacket = createMockItem('2', 'Jacket', 'outerwear');

      store.addToSlot('top', shirt);
      store.addToSlot('top', jacket);
      store.setCanvasItem('top', createMockItem('3', 'Tank Top', 'tops'));

      const topItems = useOutfitBuilderStore.getState().canvas.top;
      expect(topItems).toHaveLength(1);
      expect(topItems[0]?.name).toBe('Tank Top');
    });

    it('replaces bottom slot', () => {
      const store = useOutfitBuilderStore.getState();
      const pants = createMockItem('1', 'Pants', 'bottoms');

      store.setCanvasItem('bottom', pants);

      expect(useOutfitBuilderStore.getState().canvas.bottom?.name).toBe('Pants');
    });
  });
});
