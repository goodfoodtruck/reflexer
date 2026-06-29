import type { ConditionBlock } from '@components/ui/gambit/GambitTypes';
import { type CategoryId, type FilterEntry } from '@components/ui/gambit/filters/filterRegistry';

/**
 * Calcule les groupes AND consécutifs à partir des opérateurs inter-blocs.
 * Utilisé pour afficher les parenthèses dans la bannière en cas d'opérateurs mixtes.
 */
export function computeAndGroups(
  blocks: ConditionBlock[],
  interOps: ('AND' | 'OR')[],
): ConditionBlock[][] {
  if (blocks.length === 0) return [];

  const groups: ConditionBlock[][] = [];
  let cur: ConditionBlock[] = [blocks[0]!];
  for (let i = 0; i < interOps.length; i++) {
    if (interOps[i] === 'AND') {
      cur.push(blocks[i + 1]!);
    } else {
      groups.push(cur);
      cur = [blocks[i + 1]!];
    }
  }
  groups.push(cur);
  return groups;
}

/**
 * Convertit les entrées pending en blocs de condition (groupés par catégorie).
 */
export function buildPendingBlocks(
  entries: FilterEntry[],
  pendingValuesOperators: Record<string, 'AND' | 'OR'>,
): ConditionBlock[] {
  const byCat = new Map<CategoryId, FilterEntry['value'][]>();
  for (const e of entries) {
    const vals = byCat.get(e.categoryId) ?? [];
    vals.push(e.value);
    byCat.set(e.categoryId, vals);
  }
  return Array.from(byCat.entries()).map(([categoryId, values]) => ({
    categoryId,
    values,
    valuesOperator: pendingValuesOperators[categoryId] ?? 'OR',
  }));
}
