// Shared category/brand/tag/color option lists for products.
//
// The Admin panel lets the operator add new custom options on the fly (e.g.
// a new category beyond the original 3). Those custom additions are saved
// to localStorage and read back here by both the Admin form and the
// Collections filter, so a newly-added option shows up as a real filter
// choice too -- not just a value sitting on individual products.
//
// Known limitation: since there's no shared "taxonomy" table in Supabase
// (out of scope for now, matches the rest of this app's "temporary/simple"
// trust model), a custom option added from one browser only appears as a
// filter choice in that same browser. Products saved with it are unaffected
// either way -- this only affects whether the *filter chip* shows up
// elsewhere.

export const DEFAULT_CATEGORIES = ['Outerwear', 'Knitwear', 'Accessories'];
export const DEFAULT_BRANDS = ['SAYWAY CORE', 'SAYWAY BLACK LABEL'];
export const DEFAULT_TAGS = ['NEW ARRIVAL', 'LIMITED EDITION', 'LIMITED', 'POPULAR'];

export interface ColorOption {
  name: string; // matches Product.color exactly -- used for filtering
  hex: string;
  label: string;
}

export const DEFAULT_COLORS: ColorOption[] = [
  { name: 'black', hex: '#000000', label: 'Black' },
  { name: 'white', hex: '#FFFFFF', label: 'White' },
  { name: 'lightgray', hex: '#E5E5E5', label: 'Slate Gray' },
  { name: 'darkgray', hex: '#333333', label: 'Midnight' },
];

const KEYS = {
  categories: 'sayway_admin_extra_categories',
  brands: 'sayway_admin_extra_brands',
  tags: 'sayway_admin_extra_tags',
  colors: 'sayway_admin_extra_colors',
};

function loadList<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveList<T>(key: string, list: T[]) {
  localStorage.setItem(key, JSON.stringify(list));
}

export const getAllCategories = (): string[] =>
  Array.from(new Set([...DEFAULT_CATEGORIES, ...loadList<string>(KEYS.categories, [])]));

export const addCategory = (name: string) => {
  const extra = loadList<string>(KEYS.categories, []);
  if (!extra.includes(name)) saveList(KEYS.categories, [...extra, name]);
};

// Only ever removes from the custom (localStorage) list -- the original
// defaults are code constants and can't be deleted from the UI.
export const removeCategory = (name: string) => {
  saveList(KEYS.categories, loadList<string>(KEYS.categories, []).filter((c) => c !== name));
};
export const isCustomCategory = (name: string) => !DEFAULT_CATEGORIES.includes(name);

export const getAllBrands = (): string[] =>
  Array.from(new Set([...DEFAULT_BRANDS, ...loadList<string>(KEYS.brands, [])]));

export const addBrand = (name: string) => {
  const extra = loadList<string>(KEYS.brands, []);
  if (!extra.includes(name)) saveList(KEYS.brands, [...extra, name]);
};

export const removeBrand = (name: string) => {
  saveList(KEYS.brands, loadList<string>(KEYS.brands, []).filter((b) => b !== name));
};
export const isCustomBrand = (name: string) => !DEFAULT_BRANDS.includes(name);

export const getAllTags = (): string[] =>
  Array.from(new Set([...DEFAULT_TAGS, ...loadList<string>(KEYS.tags, [])]));

export const addTag = (name: string) => {
  const extra = loadList<string>(KEYS.tags, []);
  if (!extra.includes(name)) saveList(KEYS.tags, [...extra, name]);
};

export const removeTag = (name: string) => {
  saveList(KEYS.tags, loadList<string>(KEYS.tags, []).filter((t) => t !== name));
};
export const isCustomTag = (name: string) => !DEFAULT_TAGS.includes(name);

export const getAllColors = (): ColorOption[] => {
  const extra = loadList<ColorOption>(KEYS.colors, []);
  const merged = [...DEFAULT_COLORS];
  for (const c of extra) {
    if (!merged.some((m) => m.name === c.name)) merged.push(c);
  }
  return merged;
};

export const addColor = (color: ColorOption) => {
  const extra = loadList<ColorOption>(KEYS.colors, []);
  if (!extra.some((c) => c.name === color.name)) saveList(KEYS.colors, [...extra, color]);
};

export const removeColor = (name: string) => {
  saveList(KEYS.colors, loadList<ColorOption>(KEYS.colors, []).filter((c) => c.name !== name));
};
export const isCustomColor = (name: string) => !DEFAULT_COLORS.some((c) => c.name === name);
