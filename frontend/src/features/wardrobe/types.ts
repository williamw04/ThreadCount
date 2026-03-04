export type Category = 'tops' | 'bottoms' | 'dresses' | 'shoes' | 'accessories' | 'outerwear';

export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export interface WardrobeItem {
  id: string;
  user_id: string;
  name: string;
  category: Category;
  image_path: string | null;
  labels: string[];
  colors: string[];
  seasons: string[];
  is_inspiration: boolean;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWardrobeItemInput {
  name: string;
  category: Category;
  labels?: string[];
  colors?: string[];
  seasons?: string[];
  image?: File;
  imagePath?: string;
}

export interface UpdateWardrobeItemInput {
  name?: string;
  category?: Category;
  labels?: string[];
  colors?: string[];
  seasons?: string[];
}

export interface WardrobeFilters {
  category?: Category;
  search?: string;
  colors?: string[];
  seasons?: Season[];
}

export const CATEGORY_LABELS: Record<Category, string> = {
  tops: 'Tops',
  bottoms: 'Bottoms',
  dresses: 'Dresses',
  shoes: 'Shoes',
  accessories: 'Accessories',
  outerwear: 'Outerwear',
};

export const CATEGORIES: Category[] = ['tops', 'bottoms', 'dresses', 'shoes', 'accessories', 'outerwear'];

export const SEASONS: Season[] = ['spring', 'summer', 'fall', 'winter'];

export const SEASON_LABELS: Record<Season, string> = {
  spring: 'Spring',
  summer: 'Summer',
  fall: 'Fall',
  winter: 'Winter',
};

export const COMMON_COLORS = [
  'black', 'white', 'gray', 'navy', 'blue', 'red', 'green', 'yellow', 
  'orange', 'pink', 'purple', 'brown', 'beige', 'cream', 'tan', 'burgundy',
  'teal', 'coral', 'olive', 'charcoal'
];
