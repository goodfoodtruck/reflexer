/**
 * Conversion bidirectionnelle entre l'éditeur (DraftGambit) et les types du moteur.
 *
 * Responsabilités :
 *  - draftToConditions / conditionsToDraft  → arbre de conditions de déclenchement
 *  - draftToTargetSelector / targetFiltersToDraft → sélecteur de cible
 *  - draftToIntent → intention (action ou mouvement)
 *  - buildInitialDraft → état initial de l'éditeur depuis un gambit sauvegardé ou vide
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

/* ─────────────────────────────────────────────────────────────────────────────
 * Primitives partagées
 * ───────────────────────────────────────────────────────────────────────────── */

function buildExistsForScope(scope: Scope, filters: AnyFilter[]): ExistsCondition {
  switch (scope) {
    case 'SELF':  return { type: 'EXISTS', context: { targetType: ETargetType.SELF,  filters: filters as SelfFilter[] } };
    case 'ALLY':  return { type: 'EXISTS', context: { targetType: ETargetType.ALLY,  filters: filters as CharacterFilter[] } };
    case 'ENEMY': return { type: 'EXISTS', context: { targetType: ETargetType.ENEMY, filters: filters as EnemyFilter[] } };
  }
}

/**
 * Regroupe des ConditionGroup consécutifs en blocs AND, puis OR entre eux.
 * Utilisé quand les opérateurs ne sont pas tous identiques (opérateurs mixtes).
 * AND est prioritaire sur OR.
 */
function groupByMixedOperators(nodes: ConditionGroup[], operators: ('AND' | 'OR')[]): ConditionGroup {
  const orSections: ConditionGroup[][] = [];
  let currentAndBlock: ConditionGroup[] = [nodes[0]!];

  for (let i = 0; i < operators.length; i++) {
    const next = nodes[i + 1]!;
    if (operators[i] === 'AND') {
      currentAndBlock.push(next);
    } else {
      orSections.push(currentAndBlock);
      currentAndBlock = [next];
    }
  }
  orSections.push(currentAndBlock);

  const andGroups: ConditionGroup[] = orSections.map((block) =>
    block.length === 1 ? block[0]! : { operator: 'AND' as const, conditions: block },
  );
  return andGroups.length === 1 ? andGroups[0]! : { operator: 'OR' as const, conditions: andGroups };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Draft → Moteur : conditions de déclenchement
 * ───────────────────────────────────────────────────────────────────────────── */

function blockValuesToCondition(scope: Scope, condition: DraftCondition): ConditionGroup {
  const cat = getCategory(condition.filterTypeCategory);
  const filters = condition.blockValues
    .map((v) => cat.blockValueToFilter(v, scope))
    .filter((f): f is AnyFilter => f !== null);

  let node: ConditionGroup;
  if (filters.length <= 1) {
    node = buildExistsForScope(scope, filters);
  } else {
    const op = condition.valuesOperator ?? 'OR';
    node = { operator: op, conditions: filters.map((f) => buildExistsForScope(scope, [f])) };
  }

  return condition.negated ? { operator: 'NOT', condition: node } : node;
}

function scopeConditionsToGroup(scope: Scope, conditions: DraftCondition[]): ConditionGroup {
  const nodes = conditions.map((c) => blockValuesToCondition(scope, c));
  if (nodes.length === 1) return nodes[0]!;

  const operators = conditions.slice(0, -1).map((c) => c.scopeOperator ?? 'AND');

  if (operators.every((op) => op === operators[0])) {
    return { operator: operators[0]!, conditions: nodes };
  }

  return groupByMixedOperators(nodes, operators);
}

export const draftToConditions = (draft: DraftGambit): ConditionGroup => {
  const byScope = new Map<Scope, DraftCondition[]>();
  for (const c of draft.conditions) {
    const group = byScope.get(c.scopeKind) ?? [];
    group.push(c);
    byScope.set(c.scopeKind, group);
  }

  const scopeNodes = Array.from(byScope.entries()).map(
    ([scope, conditions]) => scopeConditionsToGroup(scope, conditions),
  );

  if (scopeNodes.length === 1) return scopeNodes[0]!;
  return { operator: draft.operator, conditions: scopeNodes };
};

/* ─────────────────────────────────────────────────────────────────────────────
 * Moteur → Draft : conditions de déclenchement
 * ───────────────────────────────────────────────────────────────────────────── */

let loadCounter = 0;

function makeDraftCondition(
  scope: Scope,
  categoryId: CategoryId,
  blockValues: BlockValue[],
  valuesOperator?: 'AND' | 'OR',
  negated?: boolean,
): DraftCondition {
  return {
    id: `loaded-${scope}-${categoryId}-${loadCounter++}-${Math.random().toString(36).slice(2, 9)}`,
    scopeKind: scope,
    filterTypeCategory: categoryId,
    blockValues,
    valuesOperator,
    negated,
  };
}

function existsNodeToBlocks(exists: ExistsCondition): DraftCondition[] {
  const scope = exists.context.targetType as Scope;
  const byCat = new Map<CategoryId, BlockValue[]>();

  for (const filter of exists.context.filters) {
    const found = filterToCategory(filter);
    if (!found) continue;
    const values = byCat.get(found.categoryId) ?? [];
    values.push(found.value);
    byCat.set(found.categoryId, values);
  }

  return Array.from(byCat.entries()).map(([categoryId, values]) =>
    makeDraftCondition(scope, categoryId, values),
  );
}

/**
 * Détecte AND/OR([EXISTS, EXISTS, …]) où tous les EXISTS partagent
 * le même scope et la même catégorie → un seul bloc multi-valeurs.
 */
function tryParseAsMultiValueBlock(operator: 'AND' | 'OR', nodes: ConditionGroup[]): DraftCondition | null {
  const parsed: { scope: Scope; categoryId: CategoryId; value: BlockValue }[] = [];

  for (const child of nodes) {
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
 * Détecte OR([EXISTS, EXISTS, …]) où tous partagent le même scope
 * mais ont des catégories différentes → plusieurs blocs reliés par OR.
 */
function tryParseAsCrossCategoryOrBlock(nodes: ConditionGroup[]): DraftCondition[] | null {
  for (const child of nodes) {
    if (!('type' in child) || child.type !== 'EXISTS') return null;
  }
  const scopes = nodes.map((c) => ('type' in c && c.type === 'EXISTS' ? (c.context.targetType as Scope) : null));
  if (scopes.length === 0 || !scopes.every((s) => s === scopes[0]) || scopes[0] === null) return null;

  const result: DraftCondition[] = [];
  for (const c of nodes) {
    if (!('type' in c) || c.type !== 'EXISTS') return null;
    result.push(...existsNodeToBlocks(c).map((b) => ({ ...b, scopeOperator: 'OR' as const })));
  }
  return result;
}

export const conditionsToDraft = (cond: ConditionGroup): DraftCondition[] => {
  if ('operator' in cond && cond.operator === 'NOT') {
    return conditionsToDraft(cond.condition).map((c) => ({ ...c, negated: true }));
  }

  if ('operator' in cond && (cond.operator === 'AND' || cond.operator === 'OR')) {
    const asMultiValue = tryParseAsMultiValueBlock(cond.operator, cond.conditions);
    if (asMultiValue) return [asMultiValue];

    if (cond.operator === 'OR') {
      const asCrossCategory = tryParseAsCrossCategoryOrBlock(cond.conditions);
      if (asCrossCategory) return asCrossCategory;
    }

    return cond.conditions.flatMap(conditionsToDraft);
  }

  if ('type' in cond && cond.type === 'EXISTS') return existsNodeToBlocks(cond);

  return [];
};

/* ─────────────────────────────────────────────────────────────────────────────
 * Draft → Moteur : sélecteur de cible
 * ───────────────────────────────────────────────────────────────────────────── */

function filterGroupToConditionNode(
  scope: Scope,
  group: FilterOrGroup,
  valuesOp: 'AND' | 'OR',
  isNegated: boolean,
): ConditionGroup {
  const existsNodes = group
    .map((entry: FilterEntry) => {
      const filter = getCategory(entry.categoryId).blockValueToFilter(entry.value, scope);
      return filter ? buildExistsForScope(scope, [filter]) : null;
    })
    .filter((e): e is ExistsCondition => e !== null);

  let node: ConditionGroup;
  if (existsNodes.length === 0) node = buildExistsForScope(scope, []);
  else if (existsNodes.length === 1) node = existsNodes[0]!;
  else node = { operator: valuesOp, conditions: existsNodes };

  return isNegated ? { operator: 'NOT', condition: node } : node;
}

function buildTargetCondition(
  scope: Scope,
  groups: FilterOrGroup[],
  groupOps: ('AND' | 'OR')[],
  valuesOps: ('AND' | 'OR')[],
  groupNegated: boolean[],
): ConditionGroup | undefined {
  if (groups.length === 0) return undefined;

  const toNode = (group: FilterOrGroup, i: number) =>
    filterGroupToConditionNode(scope, group, valuesOps[i] ?? 'OR', groupNegated[i] ?? false);

  if (groups.length === 1) return toNode(groups[0]!, 0);

  const operators = groups.slice(0, -1).map((_, i) => groupOps[i] ?? 'AND');
  const nodes = groups.map(toNode);

  if (operators.every((op) => op === operators[0])) {
    return { operator: operators[0]!, conditions: nodes };
  }

  return groupByMixedOperators(nodes, operators);
}

export const draftToTargetSelector = (draft: DraftGambit): TargetSelector => {
  const sort = sortLabelToSort(draft.targetSort);
  const { targetFilters: groups, targetFilterGroupOps: groupOps, targetFilterValuesOps: valuesOps, targetFilterGroupNegated: negated } = draft;

  switch (draft.targetKind) {
    case 'SELF':  return { context: { targetType: ETargetType.SELF }, sort };
    case 'ALLY':  return { context: { targetType: ETargetType.ALLY,  condition: buildTargetCondition('ALLY',  groups, groupOps, valuesOps, negated) }, sort };
    case 'ENEMY':
    default:      return { context: { targetType: ETargetType.ENEMY, condition: buildTargetCondition('ENEMY', groups, groupOps, valuesOps, negated) }, sort };
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
 * Moteur → Draft : sélecteur de cible
 * ───────────────────────────────────────────────────────────────────────────── */

function conditionNodeToFilterGroups(condition: ConditionGroup): FilterOrGroup[] {
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
    return condition.conditions.flatMap(conditionNodeToFilterGroups);
  }

  return [];
}

export const targetFiltersToDraft = (selector: TargetSelector): FilterOrGroup[] => {
  if (selector.context.targetType === ETargetType.SELF || !selector.context.condition) return [];
  return conditionNodeToFilterGroups(selector.context.condition);
};

export const targetSelectorToConditionGroup = (selector: TargetSelector): ConditionGroup => {
  if (selector.context.targetType === ETargetType.SELF || !selector.context.condition)
    return buildExistsForScope(selector.context.targetType as Scope, []);
  return selector.context.condition;
};

/* ─────────────────────────────────────────────────────────────────────────────
 * Draft → Moteur : intention
 * ───────────────────────────────────────────────────────────────────────────── */

const MOVEMENT_STRATEGIES = ['APPROACH', 'FLEE', 'STAY'] as const;
type MovementStrategy = (typeof MOVEMENT_STRATEGIES)[number];

const isMovementStrategy = (v: string): v is MovementStrategy =>
  (MOVEMENT_STRATEGIES as readonly string[]).includes(v);

export const draftToIntent = (draft: DraftGambit): GambitIntent =>
  draft.intentKind === 'MOVEMENT'
    ? { kind: 'MOVEMENT', strategy: isMovementStrategy(draft.intentValue) ? draft.intentValue : 'APPROACH' }
    : { kind: 'ACTION', actionId: draft.intentValue };

/* ─────────────────────────────────────────────────────────────────────────────
 * Initialisation du draft
 * ───────────────────────────────────────────────────────────────────────────── */

const EMPTY_DRAFT: DraftGambit = {
  name:                    '',
  operator:                'AND',
  conditions:              [],
  intentKind:              'ACTION',
  intentValue:             '',
  targetKind:              'ENEMY',
  targetSort:              '',
  targetFilters:           [],
  targetFilterGroupOps:    [],
  targetFilterValuesOps:   [],
  targetFilterGroupNegated: [],
};

export function buildInitialDraft(initialGambit?: StoredGambit): DraftGambit {
  if (!initialGambit) return { ...EMPTY_DRAFT };

  const conditions = initialGambit.conditions;
  const operator =
    'operator' in conditions && (conditions.operator === 'AND' || conditions.operator === 'OR')
      ? conditions.operator
      : 'AND';

  return {
    name:                    initialGambit.name,
    operator,
    conditions:              conditionsToDraft(conditions),
    intentKind:              initialGambit.intent.kind,
    intentValue:             initialGambit.intent.kind === 'MOVEMENT'
                               ? initialGambit.intent.strategy || ''
                               : initialGambit.intent.actionId || '',
    targetKind:              initialGambit.targetSelector.context.targetType,
    targetSort:              initialGambit.targetSelector.sort || 'NEAREST',
    targetFilters:           targetFiltersToDraft(initialGambit.targetSelector),
    targetFilterGroupOps:    [],
    targetFilterValuesOps:   [],
    targetFilterGroupNegated: [],
  };
}
