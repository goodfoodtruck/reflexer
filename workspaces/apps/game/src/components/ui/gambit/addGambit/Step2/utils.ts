import type { ConditionBlock } from "../../GambitTypes";
import { formatBlockValue, type BlockValue, type CategoryId } from "@components/ui/gambit/filters/filterRegistry";

export function formatBlockText(categoryId: CategoryId, values: BlockValue[]): string {
  if (values.length === 0) return '';
  const labels = values.map((v) => formatBlockValue(categoryId, v));
  if (categoryId === 'status') return `STATUS: ${labels.join('/')}`;
  return labels.join(' OU ');
}

export function buildBannerText(
  activeTarget: string | null,
  blocks: ConditionBlock[],
  blockOperator: 'AND' | 'OR',
  currentCat: CategoryId | null,
  currentValues: BlockValue[],
): string {
  if (!activeTarget) return '';

  const all = [...blocks];
  if (currentCat && currentValues.length > 0) {
    all.push({ categoryId: currentCat, values: currentValues });
  }

  const sep = blockOperator === 'OR' ? ' OU ' : ' ET ';
  const parts = all.map((b) => formatBlockText(b.categoryId, b.values));
  return `${activeTarget} : ${parts.length > 0 ? parts.join(sep) : '(SÉLECTIONNEZ UN CRITÈRE)'}`.toUpperCase();
}