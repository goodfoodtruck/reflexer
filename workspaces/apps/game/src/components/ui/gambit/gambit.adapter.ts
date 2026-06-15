import { ERange, ETargetType } from '@reflexer/engine';
import type {
  AnyFilter,
  CharacterFilter,
  ConditionGroup,
  EnemyFilter,
  ExistsCondition,
  GambitIntent,
  HasPassiveFilter,
  HpAboveFilter,
  HpBelowFilter,
  InRangeFilter,
  SelfFilter,
  TargetSelector,
  TargetSort
} from '@reflexer/engine';
import type { DraftCondition, DraftGambit } from './GambitTypes';

/**
 * Couche de conversion entre les données de l'éditeur (libellés affichés au
 * joueur, DraftGambit) et les formes canoniques du moteur, persistées telles
 * quelles en base. Toute correspondance UI <-> moteur vit ici.
 */

/** Passifs réellement définis dans le moteur, avec leur libellé joueur */
export const STATUS_OPTIONS = [
  { passiveId: 'bleed', label: 'SAIGNEMENT' },
  { passiveId: 'vulnerable', label: 'VULNÉRABLE' },
  { passiveId: 'thorns', label: 'ÉPINES' }
] as const;

export const statusLabelToPassiveId = (label: string): string | null =>
  STATUS_OPTIONS.find((s) => s.label === label)?.passiveId ?? null;

export const passiveIdToStatusLabel = (passiveId: string): string =>
  STATUS_OPTIONS.find((s) => s.passiveId === passiveId)?.label ?? passiveId;

const SORT_LABEL_TO_SORT: Record<string, TargetSort> = {
  'LE PLUS PROCHE': 'NEAREST',
  'LE PLUS ELOIGNE': 'FURTHEST',
  'LES PLUS ELEVES': 'HIGHEST_HP',
  'LES MOINS ELEVES': 'LOWEST_HP'
};

const KNOWN_SORTS: TargetSort[] = [
  'LOWEST_HP', 'HIGHEST_HP', 'NEAREST', 'FURTHEST',
  'NEAREST_FROM_ALLY', 'NEAREST_FROM_ENEMY', 'FURTHEST_FROM_ALLY', 'FURTHEST_FROM_ENEMY'
];

/** Libellé du picker de tri -> valeur moteur. Accepte aussi une valeur moteur déjà convertie. */
export const sortLabelToSort = (value: string | null): TargetSort => {
  if (!value) return 'NEAREST';
  if (KNOWN_SORTS.includes(value as TargetSort)) return value as TargetSort;
  return SORT_LABEL_TO_SORT[value] ?? 'NEAREST';
};

export const sortToLabel = (sort: string): string => {
  const entry = Object.entries(SORT_LABEL_TO_SORT).find(([, v]) => v === sort);
  return entry ? entry[0] : sort;
};

const RANGE_LABEL_TO_RANGE: Record<string, ERange> = {
  'FAIBLE DISTANCE': ERange.SHORT,
  'MOYENNE DISTANCE': ERange.MEDIUM,
  'LONGUE DISTANCE': ERange.LONG
};

export const rangeLabelToRange = (label: string): ERange =>
  RANGE_LABEL_TO_RANGE[label] ?? ERange.LONG;

export const rangeToLabel = (range: number): string => {
  const entry = Object.entries(RANGE_LABEL_TO_RANGE).find(([, v]) => v === range);
  return entry ? entry[0] : `PORTÉE ${range}`;
};

/** 'PV < 25%' / 'PV > 50%' -> filtre HP moteur */
const parseHpLabel = (label: string): HpBelowFilter | HpAboveFilter | null => {
  const match = label.match(/PV\s*([<>])\s*(\d+)/);
  if (!match) return null;
  const threshold = parseInt(match[2]!, 10);
  return match[1] === '<'
    ? { type: 'HP_BELOW', threshold }
    : { type: 'HP_ABOVE', threshold };
};

type CommonFilter = HpBelowFilter | HpAboveFilter | HasPassiveFilter | InRangeFilter;

const draftConditionToFilters = (c: DraftCondition): CommonFilter[] => {
  switch (c.filterType) {
    case 'HP_BELOW': return [{ type: 'HP_BELOW', threshold: Number(c.value) }];
    case 'HP_ABOVE': return [{ type: 'HP_ABOVE', threshold: Number(c.value) }];
    case 'IN_RANGE': return [{ type: 'IN_RANGE', range: Number(c.value) }];
    case 'HAS_PASSIVE':
      return String(c.value)
        .split(',')
        .filter(Boolean)
        .map((passiveId) => ({ type: 'HAS_PASSIVE', passiveId }));
  }
};

const toExistsCondition = (c: DraftCondition): ExistsCondition => {
  const filters = draftConditionToFilters(c);
  switch (c.scopeKind) {
    case 'SELF':
      // SELF n'accepte pas IN_RANGE (distance à soi-même sans objet)
      return {
        type: 'EXISTS',
        context: {
          targetType: ETargetType.SELF,
          filters: filters.filter((f): f is Exclude<CommonFilter, InRangeFilter> => f.type !== 'IN_RANGE') as SelfFilter[]
        }
      };
    case 'ALLY':
      return { type: 'EXISTS', context: { targetType: ETargetType.ALLY, filters: filters as CharacterFilter[] } };
    case 'ENEMY':
      return { type: 'EXISTS', context: { targetType: ETargetType.ENEMY, filters: filters as EnemyFilter[] } };
  }
};

export const draftToConditions = (draft: DraftGambit): ConditionGroup => {
  const exists = draft.conditions.map(toExistsCondition);
  return exists.length === 1
    ? exists[0]!
    : { operator: draft.operator, conditions: exists };
};

/** Blocs de filtres de cible (categoryId + libellés) -> filtres moteur */
const targetFiltersToEngine = (
  targetFilters: DraftGambit['targetFilters']
): CommonFilter[] =>
  targetFilters.flatMap((block) =>
    block.values.flatMap((label): CommonFilter[] => {
      if (block.categoryId === 'health') {
        const filter = parseHpLabel(label);
        return filter ? [filter] : [];
      }
      if (block.categoryId === 'status') {
        const passiveId = statusLabelToPassiveId(label);
        return passiveId ? [{ type: 'HAS_PASSIVE', passiveId }] : [];
      }
      return [];
    })
  );

export const draftToTargetSelector = (draft: DraftGambit): TargetSelector => {
  const sort = sortLabelToSort(draft.targetSort);
  switch (draft.targetKind) {
    case 'SELF':
      return { context: { targetType: ETargetType.SELF }, sort };
    case 'ALLY':
      return {
        context: { targetType: ETargetType.ALLY, filters: targetFiltersToEngine(draft.targetFilters) as CharacterFilter[] },
        sort
      };
    // targetKind vient de chaînes UI : tout inattendu retombe sur ENEMY
    // plutôt que de produire un selector invalide rejeté par l'API
    case 'ENEMY':
    default:
      return {
        context: { targetType: ETargetType.ENEMY, filters: targetFiltersToEngine(draft.targetFilters) as EnemyFilter[] },
        sort
      };
  }
};

const MOVEMENT_STRATEGIES = ['APPROACH', 'FLEE', 'STAY'] as const;
type MovementStrategy = (typeof MOVEMENT_STRATEGIES)[number];

const isMovementStrategy = (value: string): value is MovementStrategy =>
  (MOVEMENT_STRATEGIES as readonly string[]).includes(value);

export const draftToIntent = (draft: DraftGambit): GambitIntent =>
  draft.intentKind === 'MOVEMENT'
    ? {
        kind: 'MOVEMENT',
        strategy: isMovementStrategy(draft.intentValue) ? draft.intentValue : 'APPROACH'
      }
    : { kind: 'ACTION', actionId: draft.intentValue };

/* ------------------------------------------------------------------ */
/* Sens inverse : formes moteur -> draft, pour rouvrir un gambit en édition */

const filterToDraftFields = (
  filter: AnyFilter
): Pick<DraftCondition, 'filterType' | 'value'> | null => {
  switch (filter.type) {
    case 'HP_BELOW': return { filterType: 'HP_BELOW', value: filter.threshold };
    case 'HP_ABOVE': return { filterType: 'HP_ABOVE', value: filter.threshold };
    case 'IN_RANGE': return { filterType: 'IN_RANGE', value: filter.range };
    case 'HAS_PASSIVE': return { filterType: 'HAS_PASSIVE', value: filter.passiveId };
    default: return null;
  }
};

export const conditionsToDraft = (cond: ConditionGroup): DraftCondition[] => {
  if ('type' in cond && cond.type === 'EXISTS') {
    return cond.context.filters.flatMap((filter, i) => {
      const fields = filterToDraftFields(filter);
      if (!fields) return [];
      return [{
        id: `loaded-${cond.context.targetType}-${filter.type}-${i}-${Math.random().toString(36).slice(2, 9)}`,
        scopeKind: cond.context.targetType,
        ...fields
      }];
    });
  }
  if ('operator' in cond && cond.operator === 'NOT') return conditionsToDraft(cond.condition);
  if ('operator' in cond) return cond.conditions.flatMap(conditionsToDraft);
  return [];
};

export const targetFiltersToDraft = (
  selector: TargetSelector
): DraftGambit['targetFilters'] => {
  if (!('filters' in selector.context)) return [];
  return selector.context.filters.flatMap((filter) => {
    switch (filter.type) {
      case 'HP_BELOW': return [{ categoryId: 'health', values: [`PV < ${filter.threshold}%`] }];
      case 'HP_ABOVE': return [{ categoryId: 'health', values: [`PV > ${filter.threshold}%`] }];
      case 'HAS_PASSIVE': return [{ categoryId: 'status', values: [passiveIdToStatusLabel(filter.passiveId)] }];
      default: return [];
    }
  });
};
