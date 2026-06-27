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
  type FilterEntry,
  type FilterOrGroup,
  type Scope,
} from './filters/filterRegistry';
import { sortLabelToSort, sortToLabel, sortToFullLabel, sortToCategoryLabel } from './sorts/sortRegistry';
import type { StoredGambit } from '@services/gambit.service';

export { sortLabelToSort, sortToLabel, sortToFullLabel, sortToCategoryLabel };

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

/** Blocs d'un même scope, reliés par leurs opérateurs individuels. */
function buildScopeCondition(scope: Scope, conditions: DraftCondition[]): ConditionGroup {
  const blockNodes = conditions.map((c) => blockToCondition(scope, c));
  if (blockNodes.length === 1) return blockNodes[0]!;

  // operators[i] = opérateur entre blockNodes[i] et blockNodes[i+1]
  const operators = conditions.slice(0, -1).map((c) => c.scopeOperator ?? 'AND');

  if (operators.every((op) => op === operators[0])) {
    return { operator: operators[0]!, conditions: blockNodes };
  }

  // Opérateurs mixtes : AND prioritaire — regrouper les blocs consécutifs en ET, puis OU
  const orGroups: ConditionGroup[][] = [];
  let currentGroup: ConditionGroup[] = [blockNodes[0]!];
  for (let i = 0; i < operators.length; i++) {
    const next = blockNodes[i + 1]!;
    if (operators[i] === 'AND') {
      currentGroup.push(next);
    } else {
      orGroups.push(currentGroup);
      currentGroup = [next];
    }
  }
  orGroups.push(currentGroup);

  const andGroups: ConditionGroup[] = orGroups.map((g) =>
    g.length === 1 ? g[0]! : { operator: 'AND' as const, conditions: g },
  );
  return andGroups.length === 1 ? andGroups[0]! : { operator: 'OR' as const, conditions: andGroups };
}

/** 1 valeur → EXISTS simple ; N valeurs → ET/OU d'EXISTS selon valuesOperator. Wrap dans NOT si negated. */
function blockToCondition(scope: Scope, c: DraftCondition): ConditionGroup {
  const cat = getCategory(c.filterTypeCategory);
  const filters = c.blockValues
    .map((v) => cat.blockValueToFilter(v, scope))
    .filter((f): f is AnyFilter => f !== null);

  let node: ConditionGroup;
  if (filters.length <= 1) {
    node = buildExistsForScope(scope, filters);
  } else {
    const op = c.valuesOperator ?? 'OR';
    node = { operator: op, conditions: filters.map((f) => buildExistsForScope(scope, [f])) };
  }

  return c.negated ? { operator: 'NOT', condition: node } : node;
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

function makeDraftCondition(scope: Scope, categoryId: CategoryId, blockValues: BlockValue[], valuesOperator?: 'AND' | 'OR', negated?: boolean): DraftCondition {
  return {
    id: `loaded-${scope}-${categoryId}-${reverseCounter++}-${Math.random().toString(36).slice(2, 9)}`,
    scopeKind: scope,
    filterTypeCategory: categoryId,
    blockValues,
    valuesOperator,
    negated,
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
 * ET/OU de EXISTS (même scope, même catégorie) → un seul bloc multi-valeurs.
 * ex : { OR: [EXISTS SELF HP<25, EXISTS SELF HP<50] } → bloc { health: [<25, <50], valuesOperator: 'OR' }
 * ex : { AND: [EXISTS SELF HP<25, EXISTS SELF HP<50] } → bloc { health: [<25, <50], valuesOperator: 'AND' }
 */
function tryParseMultiValueBlock(operator: 'AND' | 'OR', conditions: ConditionGroup[]): DraftCondition | null {
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

  return makeDraftCondition(scope, categoryId, parsed.map((p) => p.value), operator);
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
  if ('operator' in cond && cond.operator === 'NOT') {
    return conditionsToDraft(cond.condition).map((c) => ({ ...c, negated: true }));
  }

  if ('operator' in cond && (cond.operator === 'AND' || cond.operator === 'OR')) {
    const asBlock = tryParseMultiValueBlock(cond.operator, cond.conditions);
    if (asBlock) return [asBlock];
    if (cond.operator === 'OR') {
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
 * Les filtres cible sont stockés comme un ConditionGroup (même type que les
 * conditions de gambit). Sémantique identique à Step2 :
 *   plusieurs valeurs dans un bloc → OU d'EXISTS
 *   plusieurs blocs                → ET
 * Le moteur évalue chaque candidat individuellement contre ce ConditionGroup.
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Construit un ConditionGroup depuis un tableau de groupes (FilterOrGroup[]).
 * groupOps[i] = opérateur entre group[i] et group[i+1] (AND par défaut).
 * valuesOps[i] = opérateur entre les valeurs du group[i] (OR par défaut).
 */
function buildTargetCondition(
  scope: Scope,
  orGroups: FilterOrGroup[],
  groupOps: ('AND' | 'OR')[] = [],
  valuesOps: ('AND' | 'OR')[] = [],
  groupNegated: boolean[] = [],
): ConditionGroup | undefined {
  if (orGroups.length === 0) return undefined;

  const groupToNode = (group: FilterOrGroup, gi: number): ConditionGroup => {
    const vop = valuesOps[gi] ?? 'OR';
    const exists = group
      .map((e) => {
        const filter = getCategory(e.categoryId).blockValueToFilter(e.value, scope);
        return filter ? buildExistsForScope(scope, [filter]) : null;
      })
      .filter((e): e is ExistsCondition => e !== null);

    let node: ConditionGroup;
    if (exists.length === 0) node = buildExistsForScope(scope, []);
    else if (exists.length === 1) node = exists[0]!;
    else node = { operator: vop, conditions: exists };

    return groupNegated[gi] ? { operator: 'NOT', condition: node } : node;
  };

  if (orGroups.length === 1) return groupToNode(orGroups[0]!, 0);

  const operators = orGroups.slice(0, -1).map((_, i) => groupOps[i] ?? 'AND');

  if (operators.every((op) => op === operators[0])) {
    return { operator: operators[0]!, conditions: orGroups.map((g, i) => groupToNode(g, i)) };
  }

  // Mixed operators: AND has priority — group AND-consecutive blocks, then OR between groups
  const orSections: ConditionGroup[][] = [];
  let current: ConditionGroup[] = [groupToNode(orGroups[0]!, 0)];
  for (let i = 0; i < operators.length; i++) {
    const next = groupToNode(orGroups[i + 1]!, i + 1);
    if (operators[i] === 'AND') {
      current.push(next);
    } else {
      orSections.push(current);
      current = [next];
    }
  }
  orSections.push(current);

  const andGroups: ConditionGroup[] = orSections.map((g) =>
    g.length === 1 ? g[0]! : { operator: 'AND' as const, conditions: g },
  );
  return andGroups.length === 1 ? andGroups[0]! : { operator: 'OR' as const, conditions: andGroups };
}

export const draftToTargetSelector = (draft: DraftGambit): TargetSelector => {
  const sort = sortLabelToSort(draft.targetSort);
  switch (draft.targetKind) {
    case 'SELF':  return { context: { targetType: ETargetType.SELF }, sort };
    case 'ALLY':  return { context: { targetType: ETargetType.ALLY,  condition: buildTargetCondition('ALLY',  draft.targetFilters, draft.targetFilterGroupOps, draft.targetFilterValuesOps, draft.targetFilterGroupNegated) }, sort };
    case 'ENEMY':
    default:      return { context: { targetType: ETargetType.ENEMY, condition: buildTargetCondition('ENEMY', draft.targetFilters, draft.targetFilterGroupOps, draft.targetFilterValuesOps, draft.targetFilterGroupNegated) }, sort };
  }
};

/**
 * Reconstruit un FilterOrGroup[] depuis le ConditionGroup stocké.
 * OR d'EXISTS → un groupe (multi-catégories possible).
 * AND → plusieurs groupes.
 */
function conditionToTargetBlocks(condition: ConditionGroup): FilterOrGroup[] {
  if ('type' in condition && condition.type === 'EXISTS') {
    const entries: FilterEntry[] = condition.context.filters
      .map((f) => filterToCategory(f))
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .map((r) => ({ categoryId: r.categoryId, value: r.value }));
    return entries.length > 0 ? [entries] : [];
  }
  if ('operator' in condition && condition.operator === 'OR') {
    const entries: FilterEntry[] = condition.conditions.flatMap((child) => {
      if (!('type' in child) || child.type !== 'EXISTS') return [];
      return child.context.filters
        .map((f) => filterToCategory(f))
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .map((r) => ({ categoryId: r.categoryId, value: r.value }));
    });
    return entries.length > 0 ? [entries] : [];
  }
  if ('operator' in condition && condition.operator === 'AND') {
    return condition.conditions.flatMap(conditionToTargetBlocks);
  }
  return [];
}

export const targetFiltersToDraft = (selector: TargetSelector): FilterOrGroup[] => {
  if (selector.context.targetType === ETargetType.SELF || !selector.context.condition) return [];
  return conditionToTargetBlocks(selector.context.condition);
};

/** Retourne le ConditionGroup stocké directement pour l'affichage dans GambitRow. */
export const targetSelectorToConditionGroup = (selector: TargetSelector): ConditionGroup => {
  if (selector.context.targetType === ETargetType.SELF || !selector.context.condition)
    return buildExistsForScope(selector.context.targetType as Scope, []);
  return selector.context.condition;
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
      targetFilterGroupOps: [],
      targetFilterValuesOps: [],
      targetFilterGroupNegated: [],
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
    targetFilterGroupOps: [],
    targetFilterValuesOps: [],
    targetFilterGroupNegated: [],
  };
}
