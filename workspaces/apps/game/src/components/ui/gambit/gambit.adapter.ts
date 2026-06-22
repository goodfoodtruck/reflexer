/**
 * Conversion bidirectionnelle entre l'éditeur (DraftGambit) et les types du moteur.
 *
 * Ce fichier ne contient QUE de la logique de conversion de données.
 * Tout ce qui est "affichage" (libellés, labels) vit dans display.ts.
 * Tout ce qui est "définition de filtres/catégories" vit dans filters/filterRegistry.ts.
 *
 * Sémantique des opérateurs :
 *  - plusieurs valeurs dans un même bloc  → OU  (ex: "à courte OU moyenne portée")
 *  - plusieurs blocs sur un même scope    → scopeOperator (ET par défaut)
 *  - plusieurs scopes                     → draft.operator
 */
import { ETargetType } from '@reflexer/engine';
import type {
  AnyFilter, CharacterFilter, ConditionGroup, EnemyFilter,
  ExistsCondition, GambitIntent, SelfFilter, TargetSelector,
} from '@reflexer/engine';
import type { DraftCondition, DraftGambit } from './GambitTypes';
import {
  filterToCategory,
  getCategory,
  type BlockValue,
  type CategoryId,
  type Scope,
} from './filters/filterRegistry';
import { sortLabelToSort, sortToLabel } from './sorts/sortRegistry';
import type { StoredGambit } from '@services/gambit.service';

export { sortLabelToSort, sortToLabel };

/* ────────────────────────────────────────────────────────────────────────────
 * DRAFT → MOTEUR
 * ────────────────────────────────────────────────────────────────────────── */

export const draftToConditions = (draft: DraftGambit): ConditionGroup => {
  const byScope = new Map<Scope, DraftCondition[]>();
  for (const c of draft.conditions) {
    const existing = byScope.get(c.scopeKind) ?? [];
    existing.push(c);
    byScope.set(c.scopeKind, existing);
  }

  const scopeNodes = Array.from(byScope.entries()).map(
    ([scope, conditions]) => buildScopeCondition(scope, conditions),
  );

  if (scopeNodes.length === 1) return scopeNodes[0]!;
  return { operator: draft.operator, conditions: scopeNodes };
};

/** Blocs d'un même scope, reliés par leur opérateur (ET par défaut). */
function buildScopeCondition(scope: Scope, conditions: DraftCondition[]): ConditionGroup {
  const blockNodes = conditions.map((c) => blockToCondition(scope, c));
  if (blockNodes.length === 1) return blockNodes[0]!;
  const op = conditions[0]?.scopeOperator ?? 'AND';
  return { operator: op, conditions: blockNodes };
}

/** 1 valeur → EXISTS simple ; N valeurs → OU d'EXISTS. */
function blockToCondition(scope: Scope, c: DraftCondition): ConditionGroup {
  const cat = getCategory(c.filterTypeCategory);
  const filters = c.blockValues
    .map((v) => cat.blockValueToFilter(v, scope))
    .filter((f): f is AnyFilter => f !== null);

  if (filters.length <= 1) return buildExistsForScope(scope, filters);
  return { operator: 'OR', conditions: filters.map((f) => buildExistsForScope(scope, [f])) };
}

function buildExistsForScope(scope: Scope, filters: AnyFilter[]): ExistsCondition {
  switch (scope) {
    case 'SELF':  return { type: 'EXISTS', context: { targetType: ETargetType.SELF,  filters: filters as SelfFilter[] } };
    case 'ALLY':  return { type: 'EXISTS', context: { targetType: ETargetType.ALLY,  filters: filters as CharacterFilter[] } };
    case 'ENEMY': return { type: 'EXISTS', context: { targetType: ETargetType.ENEMY, filters: filters as EnemyFilter[] } };
  }
}

/* ────────────────────────────────────────────────────────────────────────────
 * MOTEUR → DRAFT (réouverture en édition)
 * ────────────────────────────────────────────────────────────────────────── */

let reverseCounter = 0;

function makeDraftCondition(scope: Scope, categoryId: CategoryId, blockValues: BlockValue[]): DraftCondition {
  return {
    id: `loaded-${scope}-${categoryId}-${reverseCounter++}-${Math.random().toString(36).slice(2, 9)}`,
    scopeKind: scope,
    filterTypeCategory: categoryId,
    blockValues,
  };
}

function existsToBlocks(exists: ExistsCondition): DraftCondition[] {
  const scope = exists.context.targetType as Scope;
  const byCat = new Map<CategoryId, BlockValue[]>();

  for (const filter of exists.context.filters) {
    const found = filterToCategory(filter);
    if (!found) continue;
    const existing = byCat.get(found.categoryId) ?? [];
    existing.push(found.value);
    byCat.set(found.categoryId, existing);
  }

  return Array.from(byCat.entries()).map(([categoryId, values]) =>
    makeDraftCondition(scope, categoryId, values),
  );
}

/**
 * OU de EXISTS (même scope, même catégorie) → un seul bloc multi-valeurs.
 * ex : { OR: [EXISTS SELF HP<25, EXISTS SELF HP<50] } → bloc { health: [<25, <50] }
 */
function tryParseOrAsMultiValueBlock(conditions: ConditionGroup[]): DraftCondition | null {
  const parsed: { scope: Scope; categoryId: CategoryId; value: BlockValue }[] = [];

  for (const child of conditions) {
    if (!('type' in child) || child.type !== 'EXISTS') return null;
    if (child.context.filters.length !== 1) return null;
    const found = filterToCategory(child.context.filters[0]!);
    if (!found) return null;
    parsed.push({ scope: child.context.targetType as Scope, categoryId: found.categoryId, value: found.value });
  }

  if (parsed.length === 0) return null;
  const { scope, categoryId } = parsed[0]!;
  if (!parsed.every((p) => p.scope === scope && p.categoryId === categoryId)) return null;

  return makeDraftCondition(scope, categoryId, parsed.map((p) => p.value));
}

/**
 * OU de EXISTS (même scope, catégories différentes) → plusieurs blocs avec scopeOperator:'OR'.
 * ex : { OR: [EXISTS SELF HP<25, EXISTS SELF ARMOR<5] } → deux blocs OR'd
 */
function tryParseCrossCategoryOrBlock(conditions: ConditionGroup[]): DraftCondition[] | null {
  for (const child of conditions) {
    if (!('type' in child) || child.type !== 'EXISTS') return null;
  }
  const scopes = conditions.map((c) =>
    ('type' in c && c.type === 'EXISTS') ? (c.context.targetType as Scope) : null,
  );
  if (scopes.length === 0 || !scopes.every((s) => s === scopes[0]) || scopes[0] === null) return null;

  const result: DraftCondition[] = [];
  for (const c of conditions) {
    if (!('type' in c) || c.type !== 'EXISTS') return null;
    result.push(...existsToBlocks(c).map((b) => ({ ...b, scopeOperator: 'OR' as const })));
  }
  return result;
}

export const conditionsToDraft = (cond: ConditionGroup): DraftCondition[] => {
  if ('operator' in cond && cond.operator === 'NOT') return conditionsToDraft(cond.condition);

  if ('operator' in cond && (cond.operator === 'AND' || cond.operator === 'OR')) {
    if (cond.operator === 'OR') {
      const asBlock = tryParseOrAsMultiValueBlock(cond.conditions);
      if (asBlock) return [asBlock];
      const crossCat = tryParseCrossCategoryOrBlock(cond.conditions);
      if (crossCat) return crossCat;
    }
    return cond.conditions.flatMap(conditionsToDraft);
  }

  if ('type' in cond && cond.type === 'EXISTS') return existsToBlocks(cond);

  return [];
};

/* ────────────────────────────────────────────────────────────────────────────
 * Target selector
 *
 * ⚠️ Un TargetSelector a une liste plate de filtres (moteur : ET implicite).
 *    Pour l'affichage, on reconstruit la même sémantique que les conditions :
 *    plusieurs valeurs d'une même catégorie = OU, plusieurs catégories = ET.
 * ────────────────────────────────────────────────────────────────────────── */

const targetFiltersToEngine = (
  targetFilters: DraftGambit['targetFilters'],
  scope: Scope,
): AnyFilter[] =>
  targetFilters.flatMap((block) =>
    block.values.flatMap((value): AnyFilter[] => {
      const cat = getCategory(block.categoryId);
      const filter = cat.blockValueToFilter(value, scope);
      return filter ? [filter] : [];
    }),
  );

export const draftToTargetSelector = (draft: DraftGambit): TargetSelector => {
  const sort = sortLabelToSort(draft.targetSort);
  switch (draft.targetKind) {
    case 'SELF': return { context: { targetType: ETargetType.SELF }, sort };
    case 'ALLY': return {
      context: { targetType: ETargetType.ALLY, filters: targetFiltersToEngine(draft.targetFilters, 'ALLY') as CharacterFilter[] },
      sort,
    };
    case 'ENEMY':
    default:     return {
      context: { targetType: ETargetType.ENEMY, filters: targetFiltersToEngine(draft.targetFilters, 'ENEMY') as EnemyFilter[] },
      sort,
    };
  }
};

export const targetFiltersToDraft = (selector: TargetSelector): DraftGambit['targetFilters'] => {
  if (!('filters' in selector.context)) return [];

  const byCat = new Map<CategoryId, BlockValue[]>();
  for (const filter of selector.context.filters) {
    const found = filterToCategory(filter);
    if (!found) continue;
    const existing = byCat.get(found.categoryId) ?? [];
    existing.push(found.value);
    byCat.set(found.categoryId, existing);
  }

  return Array.from(byCat.entries()).map(([categoryId, values]) => ({ categoryId, values }));
};

/**
 * Convertit un TargetSelector en ConditionGroup pour l'affichage dans GambitRow.
 * Même sémantique que Step2 : plusieurs valeurs dans un même bloc → OU,
 * plusieurs blocs → ET. La reconstruction regroupe par catégorie (targetFiltersToDraft),
 * puis chaque groupe multi-valeurs devient un OU d'EXISTS, comme blockToCondition.
 */
export const targetSelectorToConditionGroup = (selector: TargetSelector): ConditionGroup => {
  const blocks = targetFiltersToDraft(selector);
  const scope = selector.context.targetType as Scope;

  if (blocks.length === 0) return buildExistsForScope(scope, []);

  const blockToNode = (block: { categoryId: CategoryId; values: BlockValue[] }): ConditionGroup => {
    const cat = getCategory(block.categoryId);
    const filters = block.values
      .map((v) => cat.blockValueToFilter(v, scope))
      .filter((f): f is AnyFilter => f !== null);

    if (filters.length <= 1) return buildExistsForScope(scope, filters);
    // Plusieurs valeurs dans un bloc = OU (même logique que blockToCondition en Step2).
    return { operator: 'OR', conditions: filters.map((f) => buildExistsForScope(scope, [f])) };
  };

  if (blocks.length === 1) return blockToNode(blocks[0]!);

  return { operator: 'AND', conditions: blocks.map(blockToNode) };
};

/* ────────────────────────────────────────────────────────────────────────────
 * Intent
 * ────────────────────────────────────────────────────────────────────────── */

const MOVEMENT_STRATEGIES = ['APPROACH', 'FLEE', 'STAY'] as const;
type MovementStrategy = (typeof MOVEMENT_STRATEGIES)[number];

const isMovementStrategy = (v: string): v is MovementStrategy =>
  (MOVEMENT_STRATEGIES as readonly string[]).includes(v);

export const draftToIntent = (draft: DraftGambit): GambitIntent =>
  draft.intentKind === 'MOVEMENT'
    ? { kind: 'MOVEMENT', strategy: isMovementStrategy(draft.intentValue) ? draft.intentValue : 'APPROACH' }
    : { kind: 'ACTION', actionId: draft.intentValue };

/* ────────────────────────────────────────────────────────────────────────────
 * Initialisation du draft depuis un gambit existant (ouverture en édition)
 * ────────────────────────────────────────────────────────────────────────── */

export function buildInitialDraft(initialGambit?: StoredGambit): DraftGambit {
  if (!initialGambit) {
    return {
      name: '',
      operator: 'AND',
      conditions: [],
      intentKind: 'ACTION',
      intentValue: '',
      targetKind: 'ENEMY',
      targetSort: '',
      targetFilters: [],
    };
  }

  const conditions = initialGambit.conditions;
  const operator =
    'operator' in conditions && (conditions.operator === 'AND' || conditions.operator === 'OR')
      ? conditions.operator
      : 'AND';

  return {
    name: initialGambit.name,
    operator,
    conditions: conditionsToDraft(conditions),
    intentKind: initialGambit.intent.kind,
    intentValue:
      initialGambit.intent.kind === 'MOVEMENT'
        ? initialGambit.intent.strategy || ''
        : initialGambit.intent.actionId || '',
    targetKind: initialGambit.targetSelector.context.targetType,
    targetSort: initialGambit.targetSelector.sort || 'NEAREST',
    targetFilters: targetFiltersToDraft(initialGambit.targetSelector),
  };
}
