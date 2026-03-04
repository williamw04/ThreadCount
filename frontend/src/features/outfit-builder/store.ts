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

  fetchOutfits: () => Promise<void>;
  setCanvasItem: (slot: OutfitSlot, item: OutfitItem | null) => void;
  clearCanvas: () => void;
  setSelectedSlot: (slot: OutfitSlot | null) => void;
  saveOutfit: (name: string) => Promise<void>;
  loadOutfit: (outfit: Outfit) => Promise<void>;
  deleteOutfit: (outfitId: string) => Promise<void>;
  clearError: () => void;
}

export const useOutfitBuilderStore = create<OutfitBuilderState>((set, get) => ({
  outfits: [],
  currentOutfit: null,
  canvas: {
    top1: null,
    top2: null,
    bottom: null,
    shoes: null,
  },
  isLoading: false,
  error: null,
  selectedSlot: null,

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

  setCanvasItem: (slot: OutfitSlot, item: OutfitItem | null) => {
    set((state) => ({
      canvas: { ...state.canvas, [slot]: item },
      selectedSlot: null,
    }));
  },

  clearCanvas: () => {
    set({
      canvas: {
        top1: null,
        top2: null,
        bottom: null,
        shoes: null,
      },
      currentOutfit: null,
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
    const itemIds = Object.values(canvas)
      .filter((item): item is OutfitItem => item !== null)
      .map((item) => item.id);

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
        top1: null,
        top2: null,
        bottom: null,
        shoes: null,
      };

      const categoryToSlot: Record<Category, OutfitSlot[]> = {
        tops: ['top1', 'top2'],
        dresses: ['top1'],
        outerwear: ['top1', 'top2'],
        bottoms: ['bottom'],
        shoes: ['shoes'],
        accessories: [],
      };

      for (const item of items) {
        const possibleSlots = categoryToSlot[item.category as Category] || [];
        for (const slot of possibleSlots) {
          if (!canvas[slot]) {
            canvas[slot] = {
              id: item.id,
              name: item.name,
              category: item.category as Category,
              image_path: item.image_path,
            };
            break;
          }
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
}));
