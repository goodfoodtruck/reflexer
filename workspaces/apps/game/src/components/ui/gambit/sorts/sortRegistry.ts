// sorts/sortRegistry.ts
import type { TargetSort } from '@reflexer/engine';

type SortCategoryId = 'distance_me' | 'distance_ally' | 'distance_enemy' | 'health' | 'energy' | 'armor';

type SortDefinition = {
  sort: TargetSort;
  label: string;
  categoryId: SortCategoryId;
};

const SORTS: readonly SortDefinition[] = [
  { sort: 'NEAREST',             label: 'LE PLUS PROCHE',              categoryId: 'distance_me' },
  { sort: 'FURTHEST',            label: 'LE PLUS ÉLOIGNÉ',             categoryId: 'distance_me' },
  { sort: 'NEAREST_FROM_ALLY',   label: "LE PLUS PROCHE D'UN ALLIÉ",   categoryId: 'distance_ally' },
  { sort: 'FURTHEST_FROM_ALLY',  label: "LE PLUS ÉLOIGNÉ D'UN ALLIÉ",  categoryId: 'distance_ally' },
  { sort: 'NEAREST_FROM_ENEMY',  label: "LE PLUS PROCHE D'UN ENNEMI",  categoryId: 'distance_enemy' },
  { sort: 'FURTHEST_FROM_ENEMY', label: "LE PLUS ÉLOIGNÉ D'UN ENNEMI", categoryId: 'distance_enemy' },
  { sort: 'HIGHEST_HP',          label: 'LA PLUS ÉLEVÉE',              categoryId: 'health' },
  { sort: 'LOWEST_HP',           label: 'LA MOINS ÉLEVÉE',             categoryId: 'health' },
  { sort: 'HIGHEST_ARMOR',       label: "LE PLUS D'ARMURE",            categoryId: 'armor' },
  { sort: 'LOWEST_ARMOR',        label: "LE MOINS D'ARMURE",           categoryId: 'armor' },
  { sort: 'HIGHEST_ENERGY',      label: "LE PLUS D'ÉNERGIE",           categoryId: 'energy' },
  { sort: 'LOWEST_ENERGY',       label: "LE MOINS D'ÉNERGIE",          categoryId: 'energy' },
];

const CATEGORY_LABELS: Record<SortCategoryId, string> = {
  distance_me:    'Distance de moi',
  distance_ally:  "Distance d'un allié",
  distance_enemy: "Distance d'un ennemi",
  health:         'Santé',
  energy:         'Énergie',
  armor:          'Armure',
};

export const sortToLabel = (sort: string): string =>
  SORTS.find((s) => s.sort === sort)?.label ?? sort;

export const sortLabelToSort = (label: string | null): TargetSort => {
  if (!label) return 'NEAREST';
  const direct = SORTS.find((s) => s.sort === label);
  if (direct) return direct.sort;
  return SORTS.find((s) => s.label === label)?.sort ?? 'NEAREST';
};

export const sortCategories = (): { id: SortCategoryId; label: string; options: string[] }[] => {
  const grouped = new Map<SortCategoryId, string[]>();

  for (const s of SORTS) {
    const existing = grouped.get(s.categoryId) ?? [];
    existing.push(s.label);
    grouped.set(s.categoryId, existing);
  }

  return Array.from(grouped.entries()).map(([id, options]) => ({
    id,
    label: CATEGORY_LABELS[id],
    options,
  }));
};

/** Liste des catégories de tri utilisée dans l'UI (Step4).
 *  Ajouter un tri : ajouter une entrée dans SORTS ci-dessus. */
export const SORT_CATEGORIES = sortCategories();