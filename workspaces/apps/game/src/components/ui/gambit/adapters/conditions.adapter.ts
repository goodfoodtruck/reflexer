import { ETargetType } from '@reflexer/engine';
import type {
  AnyFilter,
  CharacterFilter,
  ConditionGroup,
  EnemyFilter,
  ExistsCondition,
  SelfFilter,
} from '@reflexer/engine';
import type { DraftCondition } from '../GambitTypes';
import {
  filterToCategory,
  getCategory,
  type BlockValue,
  type CategoryId,
  type Scope,
} from '../filters/filterRegistry';

/* ────────────────────────────────────────────────────────────────────────────
 * DRAFT → MOTEUR
 * ────────────────────────────────────────────────────────────────────────── */

export function buildExistsForScope(scope: Scope, filters: AnyFilter[]): ExistsCondition {
  switch (scope) {
    case 'SELF':  return { type: 'EXISTS', context: { targetType: ETargetType.SELF,  filters: filters as SelfFilter[] } };
    case 'ALLY':  return { type: 'EXISTS', context: { targetType: ETargetType.ALLY,  filters: filters as CharacterFilter[] } };
    case 'ENEMY': return { type: 'EXISTS', context: { targetType: ETargetType.ENEMY, filters: filters as EnemyFilter[] } };
  }
}

function blockToCondition(scope: Scope, c: DraftCondition): ConditionGroup {
  const cat = getCategory(c.filterTypeCategory);
  const filters = c.blockValues
    .map((v) => cat.blockValueToFilter(v, scope))
    .filter((f): f is AnyFilter => f !== null);

  if (filters.length <= 1) return buildExistsForScope(scope, filters);
  const op = c.valuesOperator ?? 'OR';
  return { operator: op, conditions: filters.map((f) => buildExistsForScope(scope, [f])) };
}

function buildScopeCondition(scope: Scope, conditions: DraftCondition[]): ConditionGroup {
  const blockNodes = conditions.map((c) => blockToCondition(scope, c));
  if (blockNodes.length === 1) return blockNodes[0]!;

  const operators = conditions.slice(0, -1).map((c) => c.scopeOperator ?? 'AND');

  if (operators.every((op) => op === operators[0])) {
    return { operator: operators[0]!, conditions: blockNodes };
  }

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

export function draftToConditions(draft: { operator: 'AND' | 'OR'; conditions: DraftCondition[] }): ConditionGroup {
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
}

/* ────────────────────────────────────────────────────────────────────────────
 * MOTEUR → DRAFT
 * ────────────────────────────────────────────────────────────────────────── */

let reverseCounter = 0;

function makeDraftCondition(scope: Scope, categoryId: CategoryId, blockValues: BlockValue[], valuesOperator?: 'AND' | 'OR'): DraftCondition {
  return {
    id: `loaded-${scope}-${categoryId}-${reverseCounter++}-${Math.random().toString(36).slice(2, 9)}`,
    scopeKind: scope,
    filterTypeCategory: categoryId,
    blockValues,
    valuesOperator,
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

export function conditionsToDraft(cond: ConditionGroup): DraftCondition[] {
  if ('operator' in cond && cond.operator === 'NOT') return conditionsToDraft(cond.condition);

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
}
