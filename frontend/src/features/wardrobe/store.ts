import { create } from 'zustand';
import type { WardrobeItem, WardrobeFilters, Category } from './types';
import * as api from './api';
import { useAuthStore } from '@/features/auth/store';

interface WardrobeState {
  items: WardrobeItem[];
  isLoading: boolean;
  error: string | null;
  filters: WardrobeFilters;
  
  fetchItems: () => Promise<void>;
  setFilters: (filters: WardrobeFilters) => void;
  clearFilters: () => void;
  addItem: (name: string, category: Category, image?: File, labels?: string[], imagePath?: string, colors?: string[], seasons?: string[]) => Promise<void>;
  updateItem: (itemId: string, updates: Partial<WardrobeItem>) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  clearError: () => void;
}

export const useWardrobeStore = create<WardrobeState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  filters: {},
  
  fetchItems: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const { filters } = get();
      const items = await api.fetchWardrobeItems(user.id, filters);
      set({ items, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch items',
        isLoading: false 
      });
    }
  },
  
  setFilters: (filters: WardrobeFilters) => {
    set({ filters });
    get().fetchItems();
  },
  
  clearFilters: () => {
    set({ filters: {} });
    get().fetchItems();
  },
  
  addItem: async (name: string, category: Category, image?: File, labels?: string[], imagePath?: string, colors?: string[], seasons?: string[]) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      await api.createWardrobeItem(user.id, {
        name,
        category: category || 'tops',
        image,
        labels,
        colors,
        seasons,
        imagePath,
      });
      await get().fetchItems();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add item',
        isLoading: false 
      });
      throw error;
    }
  },
  
  updateItem: async (itemId: string, updates: Partial<WardrobeItem>) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      await api.updateWardrobeItem(itemId, user.id, {
        name: updates.name,
        category: updates.category,
        labels: updates.labels,
      });
      await get().fetchItems();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update item',
        isLoading: false 
      });
      throw error;
    }
  },
  
  deleteItem: async (itemId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      await api.deleteWardrobeItem(itemId, user.id);
      await get().fetchItems();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete item',
        isLoading: false 
      });
      throw error;
    }
  },
  
  clearError: () => {
    set({ error: null });
  },
}));
