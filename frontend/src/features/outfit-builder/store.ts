/* eslint-disable max-lines -- ponytail: pre-existing 516 lines, split when next touched */
/**
 * Outfit builder store — manages the canvas composition state, saved outfits,
 * and AI try-on generation.
 *
 * Canvas state is more complex than typical CRUD because:
 * - "top" and accessory slots support multiple layered items (arrays)
 * - "bottom" and "shoes" are single-item slots
 * - Layer visibility is tracked by separate index state (topLayerIndex, etc.)
 *   that toggles which item in a multi-item slot is rendered on top
 * - Accessories can be dragged between left and right rails
 *
 * The `loadOutfit` action maps a persisted outfit's `item_ids` back into
 * canvas slots by category, distributing accessories evenly across rails.
 *
 * `saveOutfit` performs a two-phase save: first creates/updates the outfit
 * record, then generates a composite thumbnail asynchronously. Thumbnail
 * failure is non-blocking — the outfit is still saved.
 */
import { create } from 'zustand';
import type { Outfit, OutfitItem, OutfitCanvasState, OutfitSlot } from './types';
import * as api from './api';
import type { TryOnResult } from './api';
import { supabase } from '@/shared/api/supabase';
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
  generatedImage: TryOnResult | null;
  isGeneratingTryOn: boolean;
  tryOnError: string | null;

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
  generateTryOn: () => Promise<void>;
  clearGeneratedImage: () => void;
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
  generatedImage: null,
  isGeneratingTryOn: false,
  tryOnError: null,

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

  /**
   * Appends an item to a slot. For array slots (top, accessoriesLeft/Right),
   * this adds to the existing items. For single slots (bottom, shoes),
   * this replaces the current item. Resets the layer index so the newly
   * added item becomes the active visible layer.
   */
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

  /**
   * Replaces the contents of a slot with a single item, discarding any
   * existing layers. Used when swapping an entire slot rather than adding
   * a layer on top of existing items.
   */
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

  /**
   * Moves an accessory between left and right rails via drag-and-drop.
   * Only cross-rail moves are handled; same-rail reordering is a no-op.
   */
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
      generatedImage: null,
      tryOnError: null,
    });
  },

  setSelectedSlot: (slot: OutfitSlot | null) => {
    set({ selectedSlot: slot });
  },

  /**
   * Persists the current canvas composition as a named outfit.
   *
   * Two-phase save:
   * 1. Create or update the outfit record with name + item_ids
   * 2. Generate a composite thumbnail (POST /api/outfits/generate-thumbnail)
   *    and attach it to the outfit. Thumbnail failure is caught and logged
   *    but does not roll back the outfit save.
   */
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

      try {
        const thumbnail = await api.generateOutfitThumbnail(user.id, itemIds);
        if (currentOutfit) {
          await api.updateOutfit(currentOutfit.id, user.id, { name, item_ids: itemIds });
          await supabase
            .from('outfits')
            .update({ thumbnail_path: thumbnail.thumbnail_path })
            .eq('id', currentOutfit.id);
        } else {
          const { data: newOutfit } = await supabase
            .from('outfits')
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          if (newOutfit) {
            await supabase
              .from('outfits')
              .update({ thumbnail_path: thumbnail.thumbnail_path })
              .eq('id', newOutfit.id);
          }
        }
      } catch (thumbnailError) {
        console.warn('Failed to generate thumbnail:', thumbnailError);
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

  /**
   * Loads a saved outfit onto the canvas by fetching its wardrobe items
   * and distributing them into canvas slots by category.
   *
   * Accessories are distributed across left/right rails using an alternating
   * toggle. Tops/dresses/outerwear all go into the `top` array. Only the
   * first bottom and first shoes item are placed (single-item slots).
   */
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

  /**
   * Generates an AI try-on image from the current canvas composition.
   * Collects all item IDs from every slot and sends them to POST /api/try-on/generate.
   * Requires the user to have an avatar with `model_status: "ready"`.
   * The result is stored in `generatedImage` and rendered below the canvas.
   */
  generateTryOn: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ tryOnError: 'User not authenticated', isGeneratingTryOn: false });
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
      set({ tryOnError: 'Add at least one item to the outfit', isGeneratingTryOn: false });
      return;
    }

    set({ isGeneratingTryOn: true, tryOnError: null, generatedImage: null });

    try {
      const result = await api.generateTryOn(user.id, itemIds, currentOutfit?.id);
      set({ generatedImage: result, isGeneratingTryOn: false });
    } catch (error) {
      set({
        tryOnError: error instanceof Error ? error.message : 'Failed to generate try-on',
        isGeneratingTryOn: false,
      });
    }
  },

  clearGeneratedImage: () => {
    set({ generatedImage: null, tryOnError: null });
  },
}));
