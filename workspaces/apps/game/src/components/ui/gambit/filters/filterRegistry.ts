import type { AnyFilter, ERange } from '@reflexer/engine';
import {
  isRangeRelationFilterType,
  rangeRelationCategory,
  resolveRangeRelationType,
  type RangeRelationCategoryId,
} from './rangeRelations';
import { rangeToLabel, ALL_RANGES } from './rangeFilters';

/**
 * Identifiant unique d'une catégorie côté éditeur.
 * Cette union est la liste exhaustive des catégories que l'UI peut produire.
 */
export type CategoryId =
  | 'status'
  | 'health'
  | 'armor'
  | 'energy'
  | 'distance_me'
  | RangeRelationCategoryId; // 'in_range_of_ally' | 'in_range_of_enemy'

/**
 * Un BlockValue représente UNE valeur sélectionnée par le joueur dans la
 * catégorie. Discriminé par le 'kind' de catégorie pour éviter de stocker
 * du libre format string qu'il faudra reparser plus tard.
 */
export type BlockValue =
  | { kind: 'threshold'; op: '<' | '>'; value: number }   // health/armor/energy
  | { kind: 'range';     range: ERange }                   // toutes les distances
  | { kind: 'passive';   passiveId: string };              // status

/** Ce qu'un EXISTS produit et consomme à l'écran. */
export type ConditionBlock = {
  categoryId: CategoryId;
  values: BlockValue[];
  /** Opérateur entre les valeurs du bloc (OU par défaut). */
  valuesOperator?: 'AND' | 'OR';
};

export type Scope = 'SELF' | 'ALLY' | 'ENEMY';

/**
 * Chaque catégorie sait :
 *  - quelles options d'UI elle propose (génératives, plus de regex),
 *  - comment formater chaque option pour l'affichage,
 *  - comment convertir un BlockValue en filtre moteur (selon le scope),
 *  - et l'inverse, depuis un filtre moteur vers un BlockValue.
 *
 * 'allowedScopes' est consulté pour filtrer les catégories proposées
 * selon le contexte courant. Plus de logique éparpillée dans le hook.
 */
export type CategoryDefinition = {
  id: CategoryId;
  label: string;
  allowedScopes: readonly Scope[];
  options: readonly BlockValueOption[];
  blockValueToFilter: (value: BlockValue, scope: Scope) => AnyFilter | null;
  filterToBlockValue: (filter: AnyFilter) => BlockValue | null;
};

/** Une option proposée dans le picker = un BlockValue + son libellé. */
export type BlockValueOption = { value: BlockValue; label: string };

/** Une entrée dans un bloc OR multi-catégories (chaque valeur connaît sa catégorie). */
export type FilterEntry = { categoryId: CategoryId; value: BlockValue };

/** Un groupe OU : toutes les entrées sont OR'd ensemble, potentiellement de catégories différentes. */
export type FilterOrGroup = FilterEntry[];

/* --- Fabriques d'options réutilisables ------------------------------- */

const thresholdLabel = (axis: 'PV' | 'ARMURE' | 'ÉNERGIE', op: '<' | '>', n: number) =>
  `${axis} ${op} ${n}%`;

const thresholdOptions = (
  axis: 'PV' | 'ARMURE' | 'ÉNERGIE',
  lessThan: readonly number[],
  greaterThan: readonly number[],
): BlockValueOption[] => [
  ...lessThan.map((n) => ({ value: { kind: 'threshold' as const, op: '<' as const, value: n }, label: thresholdLabel(axis, '<', n) })),
  ...greaterThan.map((n) => ({ value: { kind: 'threshold' as const, op: '>' as const, value: n }, label: thresholdLabel(axis, '>', n) })),
];

const rangeOptions = (): BlockValueOption[] =>
  ALL_RANGES.map((r) => ({
    value: { kind: 'range' as const, range: r },
    label: rangeToLabel(r),
  }));

/* --- Helpers de conversion stat -------------------------------------- */

const buildThresholdFilter = (
  axis: 'HP' | 'ARMOR' | 'ENERGY',
  value: BlockValue,
): AnyFilter | null => {
  if (value.kind !== 'threshold') return null;
  const type = `${axis}_${value.op === '<' ? 'BELOW' : 'ABOVE'}` as
    | 'HP_BELOW' | 'HP_ABOVE' | 'ARMOR_BELOW' | 'ARMOR_ABOVE' | 'ENERGY_BELOW' | 'ENERGY_ABOVE';
  return { type, threshold: value.value } as AnyFilter;
};

const extractThreshold = (
  axes: readonly string[],
  filter: AnyFilter,
): BlockValue | null => {
  if (!axes.includes(filter.type)) return null;
  const op = filter.type.endsWith('_BELOW') ? '<' : '>';
  return { kind: 'threshold', op, value: (filter as { threshold: number }).threshold };
};

// filterRegistry.ts — remplace la catégorie status

const STATUS_ENTRIES = [
  { passiveId: 'bleed',      label: 'SAIGNEMENT' },
  { passiveId: 'vulnerable', label: 'VULNÉRABLE' },
  { passiveId: 'thorns',     label: 'ÉPINES' },
] as const;

const statusOptions = (): BlockValueOption[] =>
  STATUS_ENTRIES.map((s) => ({
    value: { kind: 'passive' as const, passiveId: s.passiveId },
    label: s.label,
  }));


/* --- LE REGISTRY ------------------------------------------------------- */

export const REGISTRY: Record<CategoryId, CategoryDefinition> = {
    status: {
        id: 'status',
        label: 'Passifs',
        allowedScopes: ['SELF', 'ALLY', 'ENEMY'],
        options: statusOptions(),   // ← directement initialisé
        blockValueToFilter: (v) =>
            v.kind === 'passive' ? { type: 'HAS_PASSIVE', passiveId: v.passiveId } : null,
        filterToBlockValue: (f) =>
            f.type === 'HAS_PASSIVE' ? { kind: 'passive', passiveId: f.passiveId } : null,
    },

  health: {
    id: 'health',
    label: 'Santé',
    allowedScopes: ['SELF', 'ALLY', 'ENEMY'],
    options: thresholdOptions('PV', [25, 50, 75, 100], [25, 50, 75]),
    blockValueToFilter: (v) => buildThresholdFilter('HP', v),
    filterToBlockValue: (f) => extractThreshold(['HP_BELOW', 'HP_ABOVE'], f),
  },

  armor: {
    id: 'armor',
    label: 'Armure',
    allowedScopes: ['SELF', 'ALLY', 'ENEMY'],
    options: thresholdOptions('ARMURE', [5, 10, 15, 20, 25], [25, 50, 75]),
    blockValueToFilter: (v) => buildThresholdFilter('ARMOR', v),
    filterToBlockValue: (f) => extractThreshold(['ARMOR_BELOW', 'ARMOR_ABOVE'], f),
  },

  energy: {
    id: 'energy',
    label: 'Énergie',
    allowedScopes: ['SELF', 'ALLY', 'ENEMY'],
    options: thresholdOptions('ÉNERGIE', [25, 50, 75, 100], [25, 50, 75]),
    blockValueToFilter: (v) => buildThresholdFilter('ENERGY', v),
    filterToBlockValue: (f) => extractThreshold(['ENERGY_BELOW', 'ENERGY_ABOVE'], f),
  },

  distance_me: {
    id: 'distance_me',
    label: 'Distance de moi',
    allowedScopes: ['ALLY', 'ENEMY'], // exclu sur SELF (pas de distance à soi-même)
    options: rangeOptions(),
    blockValueToFilter: (v) =>
      v.kind === 'range' ? { type: 'IN_RANGE', range: v.range } : null,
    filterToBlockValue: (f) =>
      f.type === 'IN_RANGE' ? { kind: 'range', range: f.range } : null,
  },

  in_range_of_ally: {
    id: 'in_range_of_ally',
    label: "À portée d'un allié",
    allowedScopes: ['ALLY', 'ENEMY'],
    options: rangeOptions(),
    blockValueToFilter: (v, scope) => {
      if (v.kind !== 'range') return null;
      const type = resolveRangeRelationType(scope, 'in_range_of_ally');
      return type ? ({ type, range: v.range } as AnyFilter) : null;
    },
    filterToBlockValue: (f) =>
      isRangeRelationFilterType(f.type) && rangeRelationCategory(f.type) === 'in_range_of_ally'
        ? { kind: 'range', range: (f as { range: ERange }).range }
        : null,
  },

  in_range_of_enemy: {
    id: 'in_range_of_enemy',
    label: "À portée d'un ennemi",
    allowedScopes: ['ALLY', 'ENEMY'],
    options: rangeOptions(),
    blockValueToFilter: (v, scope) => {
      if (v.kind !== 'range') return null;
      const type = resolveRangeRelationType(scope, 'in_range_of_enemy');
      return type ? ({ type, range: v.range } as AnyFilter) : null;
    },
    filterToBlockValue: (f) =>
      isRangeRelationFilterType(f.type) && rangeRelationCategory(f.type) === 'in_range_of_enemy'
        ? { kind: 'range', range: (f as { range: ERange }).range }
        : null,
  },
};

/* --- API publique du registry ---------------------------------------- */

export const ALL_CATEGORIES = Object.values(REGISTRY) as readonly CategoryDefinition[];

export const getCategory = (id: CategoryId): CategoryDefinition => REGISTRY[id];

export const categoriesForScope = (scope: Scope): readonly CategoryDefinition[] =>
  ALL_CATEGORIES.filter((c) => c.allowedScopes.includes(scope));

/** Toutes les catégories utilisables comme filtre de CIBLE. */
export const TARGET_FILTER_CATEGORIES: readonly CategoryDefinition[] = ALL_CATEGORIES;

/**
 * Trouve la catégorie qui sait reconstruire un BlockValue depuis ce filtre.
 * Sert au sens "moteur → éditeur" (rouvrir un gambit).
 */
export const filterToCategory = (filter: AnyFilter): { categoryId: CategoryId; value: BlockValue } | null => {
  for (const cat of ALL_CATEGORIES) {
    const v = cat.filterToBlockValue(filter);
    if (v) return { categoryId: cat.id, value: v };
  }
  return null;
};

/** Libellé d'affichage d'un BlockValue dans une catégorie donnée. */
export const formatBlockValue = (categoryId: CategoryId, value: BlockValue): string => {
  const cat = REGISTRY[categoryId];
  const found = cat.options.find((o) => sameBlockValue(o.value, value));
  return found?.label ?? '?';
};

export const sameBlockValue = (a: BlockValue, b: BlockValue): boolean => {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'threshold' && b.kind === 'threshold') return a.op === b.op && a.value === b.value;
  if (a.kind === 'range'     && b.kind === 'range')     return a.range === b.range;
  if (a.kind === 'passive'   && b.kind === 'passive')   return a.passiveId === b.passiveId;
  return false;
};