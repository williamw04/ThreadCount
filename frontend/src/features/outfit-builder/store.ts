import { create } from 'zustand';
import type { Outfit, OutfitItem, OutfitCanvasState, OutfitSlot } from './types';
import * as api from './api';
import { useAuthStore } from '@/features/auth/store';
import type { Category } from '@/features/wardrobe/types';

interface OutfitBuilderState {
  outfits: Outfit[];
  currentOutfit: Outfit | null;
  canvas: OutfitCanvasState;
  isLoading: boolean;
  error: string | null;
  selectedSlot: OutfitSlot | null;
  topLayerIndex: number;
  accessoryLeftLayerIndex: number;
  accessoryRightLayerIndex: number;

  fetchOutfits: () => Promise<void>;
  addToSlot: (slot: OutfitSlot, item: OutfitItem) => void;
  setCanvasItem: (slot: OutfitSlot, item: OutfitItem) => void;
  removeFromSlot: (slot: OutfitSlot, index?: number) => void;
  moveAccessory: (
    fromSlot: 'accessoriesLeft' | 'accessoriesRight',
    toSlot: 'accessoriesLeft' | 'accessoriesRight',
    fromIndex: number,
    toIndex?: number,
  ) => void;
  clearCanvas: () => void;
  setSelectedSlot: (slot: OutfitSlot | null) => void;
  saveOutfit: (name: string) => Promise<void>;
  loadOutfit: (outfit: Outfit) => Promise<void>;
  deleteOutfit: (outfitId: string) => Promise<void>;
  clearError: () => void;
  swapTopLayer: () => void;
  swapAccessoryLeftLayer: () => void;
  swapAccessoryRightLayer: () => void;
}

export const useOutfitBuilderStore = create<OutfitBuilderState>((set, get) => ({
  outfits: [],
  currentOutfit: null,
  canvas: {
    top: [],
    bottom: null,
    shoes: null,
    accessoriesLeft: [],
    accessoriesRight: [],
  },
  isLoading: false,
  error: null,
  selectedSlot: null,
  topLayerIndex: 0,
  accessoryLeftLayerIndex: 0,
  accessoryRightLayerIndex: 0,

  fetchOutfits: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const outfits = await api.fetchOutfits(user.id);
      set({ outfits, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch outfits',
        isLoading: false,
      });
    }
  },

  addToSlot: (slot: OutfitSlot, item: OutfitItem) => {
    set((state) => {
      if (slot === 'top') {
        return {
          canvas: { ...state.canvas, top: [...state.canvas.top, item] },
          selectedSlot: null,
          topLayerIndex: 0,
        };
      }
      if (slot === 'accessoriesLeft') {
        return {
          canvas: { ...state.canvas, accessoriesLeft: [...state.canvas.accessoriesLeft, item] },
          selectedSlot: null,
          accessoryLeftLayerIndex: 0,
        };
      }
      if (slot === 'accessoriesRight') {
        return {
          canvas: { ...state.canvas, accessoriesRight: [...state.canvas.accessoriesRight, item] },
          selectedSlot: null,
          accessoryRightLayerIndex: 0,
        };
      }
      return {
        canvas: { ...state.canvas, [slot]: item },
        selectedSlot: null,
      };
    });
  },

  setCanvasItem: (slot: OutfitSlot, item: OutfitItem) => {
    set((state) => {
      if (slot === 'top') {
        return {
          canvas: { ...state.canvas, top: [item] },
          selectedSlot: null,
          topLayerIndex: 0,
        };
      }
      if (slot === 'accessoriesLeft') {
        return {
          canvas: { ...state.canvas, accessoriesLeft: [item] },
          selectedSlot: null,
          accessoryLeftLayerIndex: 0,
        };
      }
      if (slot === 'accessoriesRight') {
        return {
          canvas: { ...state.canvas, accessoriesRight: [item] },
          selectedSlot: null,
          accessoryRightLayerIndex: 0,
        };
      }
      return {
        canvas: { ...state.canvas, [slot]: item },
        selectedSlot: null,
      };
    });
  },

  removeFromSlot: (slot: OutfitSlot, index?: number) => {
    set((state) => {
      if (slot === 'top' && index !== undefined) {
        const newTop = [...state.canvas.top];
        newTop.splice(index, 1);
        return { canvas: { ...state.canvas, top: newTop }, topLayerIndex: 0 };
      }
      if (slot === 'accessoriesLeft' && index !== undefined) {
        const newAccessories = [...state.canvas.accessoriesLeft];
        newAccessories.splice(index, 1);
        return {
          canvas: { ...state.canvas, accessoriesLeft: newAccessories },
          accessoryLeftLayerIndex: 0,
        };
      }
      if (slot === 'accessoriesRight' && index !== undefined) {
        const newAccessories = [...state.canvas.accessoriesRight];
        newAccessories.splice(index, 1);
        return {
          canvas: { ...state.canvas, accessoriesRight: newAccessories },
          accessoryRightLayerIndex: 0,
        };
      }
      return { canvas: { ...state.canvas, [slot]: null } };
    });
  },

  moveAccessory: (
    fromSlot: 'accessoriesLeft' | 'accessoriesRight',
    toSlot: 'accessoriesLeft' | 'accessoriesRight',
    fromIndex: number,
    _toIndex?: number,
  ) => {
    set((state) => {
      const fromItems =
        fromSlot === 'accessoriesLeft'
          ? state.canvas.accessoriesLeft
          : state.canvas.accessoriesRight;
      const toItems =
        toSlot === 'accessoriesLeft' ? state.canvas.accessoriesLeft : state.canvas.accessoriesRight;

      const item = fromItems[fromIndex];
      if (!item) return state;

      const newFromItems = [...fromItems];
      newFromItems.splice(fromIndex, 1);

      const newToItems = [...toItems, item];

      if (fromSlot === 'accessoriesLeft' && toSlot === 'accessoriesRight') {
        return {
          canvas: {
            ...state.canvas,
            accessoriesLeft: newFromItems,
            accessoriesRight: newToItems,
          },
        };
      }
      if (fromSlot === 'accessoriesRight' && toSlot === 'accessoriesLeft') {
        return {
          canvas: {
            ...state.canvas,
            accessoriesLeft: newToItems,
            accessoriesRight: newFromItems,
          },
        };
      }
      return state;
    });
  },

  clearCanvas: () => {
    set({
      canvas: {
        top: [],
        bottom: null,
        shoes: null,
        accessoriesLeft: [],
        accessoriesRight: [],
      },
      currentOutfit: null,
      topLayerIndex: 0,
      accessoryLeftLayerIndex: 0,
      accessoryRightLayerIndex: 0,
    });
  },

  setSelectedSlot: (slot: OutfitSlot | null) => {
    set({ selectedSlot: slot });
  },

  saveOutfit: async (name: string) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }

    const { canvas, currentOutfit } = get();
    const itemIds = [
      ...canvas.top.map((item) => item.id),
      ...(canvas.bottom ? [canvas.bottom.id] : []),
      ...(canvas.shoes ? [canvas.shoes.id] : []),
      ...canvas.accessoriesLeft.map((item) => item.id),
      ...canvas.accessoriesRight.map((item) => item.id),
    ];

    if (itemIds.length === 0) {
      set({ error: 'Add at least one item to the outfit' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      if (currentOutfit) {
        await api.updateOutfit(currentOutfit.id, user.id, { name, item_ids: itemIds });
      } else {
        await api.createOutfit(user.id, { name, item_ids: itemIds });
      }
      await get().fetchOutfits();
      set({ isLoading: false, currentOutfit: null });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save outfit',
        isLoading: false,
      });
      throw error;
    }
  },

  loadOutfit: async (outfit: Outfit) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true, error: null, currentOutfit: outfit });

    try {
      const items = await api.fetchOutfitItems(outfit.item_ids);
      const canvas: OutfitCanvasState = {
        top: [],
        bottom: null,
        shoes: null,
        accessoriesLeft: [],
        accessoriesRight: [],
      };

      let accessoryToggle = false;
      for (const item of items) {
        const category = item.category as Category;
        if (category === 'tops' || category === 'dresses' || category === 'outerwear') {
          canvas.top.push({
            id: item.id,
            name: item.name,
            category,
            image_path: item.image_path,
          });
        } else if (category === 'bottoms' && !canvas.bottom) {
          canvas.bottom = {
            id: item.id,
            name: item.name,
            category,
            image_path: item.image_path,
          };
        } else if (category === 'shoes' && !canvas.shoes) {
          canvas.shoes = {
            id: item.id,
            name: item.name,
            category,
            image_path: item.image_path,
          };
        } else if (category === 'accessories') {
          if (accessoryToggle) {
            canvas.accessoriesLeft.push({
              id: item.id,
              name: item.name,
              category,
              image_path: item.image_path,
            });
          } else {
            canvas.accessoriesRight.push({
              id: item.id,
              name: item.name,
              category,
              image_path: item.image_path,
            });
          }
          accessoryToggle = !accessoryToggle;
        }
      }

      set({ canvas, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load outfit',
        isLoading: false,
      });
    }
  },

  deleteOutfit: async (outfitId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      await api.deleteOutfit(outfitId, user.id);
      await get().fetchOutfits();
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete outfit',
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  swapTopLayer: () => {
    const { canvas, topLayerIndex } = get();
    if (canvas.top.length > 1) {
      set({ topLayerIndex: topLayerIndex === 0 ? 1 : 0 });
    }
  },

  swapAccessoryLeftLayer: () => {
    const { canvas, accessoryLeftLayerIndex } = get();
    if (canvas.accessoriesLeft.length > 1) {
      set({ accessoryLeftLayerIndex: accessoryLeftLayerIndex === 0 ? 1 : 0 });
    }
  },

  swapAccessoryRightLayer: () => {
    const { canvas, accessoryRightLayerIndex } = get();
    if (canvas.accessoriesRight.length > 1) {
      set({ accessoryRightLayerIndex: accessoryRightLayerIndex === 0 ? 1 : 0 });
    }
  },
}));
