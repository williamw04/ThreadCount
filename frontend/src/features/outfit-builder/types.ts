import type { Category } from '@/features/wardrobe/types';

export interface Outfit {
  id: string;
  user_id: string;
  name: string | null;
  item_ids: string[];
  thumbnail_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface OutfitItem {
  id: string;
  name: string;
  category: Category;
  image_path: string | null;
}

export interface OutfitCreateInput {
  name?: string;
  item_ids: string[];
}

export interface OutfitUpdateInput {
  name?: string;
  item_ids?: string[];
}

export type OutfitSlot = 'top1' | 'top2' | 'bottom' | 'shoes';

export interface OutfitCanvasState {
  top1: OutfitItem | null;
  top2: OutfitItem | null;
  bottom: OutfitItem | null;
  shoes: OutfitItem | null;
}

export const SLOT_ORDER: OutfitSlot[] = ['top1', 'top2', 'bottom', 'shoes'];

export const SLOT_LABELS: Record<OutfitSlot, string> = {
  top1: 'Top',
  top2: 'Layer',
  bottom: 'Bottoms',
  shoes: 'Shoes',
};

export const SLOT_CATEGORIES: Record<OutfitSlot, Category[]> = {
  top1: ['tops', 'dresses', 'outerwear'],
  top2: ['tops', 'outerwear'],
  bottom: ['bottoms'],
  shoes: ['shoes'],
};
