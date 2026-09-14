/**
 * Looks store — manages the unified look collection and active filter.
 *
 * Unlike the wardrobe store which triggers server-side refetch on filter change,
 * the looks store applies filters client-side. This is because the data is
 * already fully loaded from two parallel API calls — re-fetching on every
 * filter toggle would be wasteful.
 *
 * `deleteLook` resolves the look type from the store's `looks` array before
 * calling the API, which routes to the correct endpoint based on `look.type`.
 */
import { create } from 'zustand';
import type { Look, LookFilter } from './types';
import * as api from './api';
import { useAuthStore } from '@/features/auth/store';

interface LooksState {
  looks: Look[];
  filter: LookFilter;
  isLoading: boolean;
  error: string | null;

  fetchLooks: () => Promise<void>;
  setFilter: (filter: LookFilter) => void;
  deleteLook: (lookId: string) => Promise<void>;
  clearError: () => void;
}

export const useLooksStore = create<LooksState>((set, get) => ({
  looks: [],
  filter: 'all',
  isLoading: false,
  error: null,

  fetchLooks: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const looks = await api.fetchLooks(user.id);
      set({ looks, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch looks',
        isLoading: false,
      });
    }
  },

  setFilter: (filter: LookFilter) => {
    set({ filter });
  },

  deleteLook: async (lookId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }

    const { looks } = get();
    const lookToDelete = looks.find((l) => l.id === lookId);

    if (!lookToDelete) {
      set({ error: 'Look not found' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      await api.deleteLook(lookToDelete, user.id);
      await get().fetchLooks();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete look',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
