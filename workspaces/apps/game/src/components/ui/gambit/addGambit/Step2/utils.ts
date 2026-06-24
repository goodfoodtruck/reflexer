import type { ConditionBlock } from "../../GambitTypes";
import { formatBlockValue, type CategoryId, type FilterEntry } from "@components/ui/gambit/filters/filterRegistry";

export function formatBlockText(
  categoryId: CategoryId,
  values: FilterEntry['value'][],
  valuesOperator: 'AND' | 'OR' = 'OR',
): string {
  if (values.length === 0) return '';
  const labels = values.map((v) => formatBlockValue(categoryId, v));
  if (categoryId === 'status') return `PASSIF : ${labels.join('/')}`;
  const sep = valuesOperator === 'AND' ? ' ET ' : ' OU ';
  return labels.join(sep);
}

export function buildBannerText(
  activeTarget: string | null,
  blocks: ConditionBlock[],
  blockOperators: ('AND' | 'OR')[],
  currentBlockEntries: FilterEntry[],
  pendingValuesOperators: Record<string, 'AND' | 'OR'> = {},
): string {
  if (!activeTarget) return '';

  const allBlocks = [...blocks];
  const allOps = [...blockOperators];

  if (currentBlockEntries.length > 0) {
    const byCat = new Map<CategoryId, FilterEntry['value'][]>();
    for (const e of currentBlockEntries) {
      const vals = byCat.get(e.categoryId) ?? [];
      vals.push(e.value);
      byCat.set(e.categoryId, vals);
    }
    const N = byCat.size;
    for (const [categoryId, values] of byCat) {
      allBlocks.push({ categoryId, values, valuesOperator: pendingValuesOperators[categoryId] ?? 'OR' });
    }
    if (N > 1) allOps.push(...new Array(N - 1).fill('OR' as const));
    allOps.push('AND' as const);
  }

  const parts = allBlocks.map((b) => formatBlockText(b.categoryId, b.values, b.valuesOperator ?? 'OR'));
  if (parts.length === 0) return `${activeTarget} : (SÉLECTIONNEZ UN CRITÈRE)`.toUpperCase();

  const joined = parts.reduce((acc, p, i) => {
    if (i === 0) return p;
    const sep = allOps[i - 1] === 'OR' ? ' OU ' : ' ET ';
    return `${acc}${sep}${p}`;
  }, '');

  return `${activeTarget} : ${joined}`.toUpperCase();
}
