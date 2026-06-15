import type { ConditionBlock } from "../../GambitTypes";

export function formatBlockText(catId: string, values: string[]): string {
  if (values.length === 0) return '';
  if (catId === 'status') return `STATUS: ${values.join('/')}`;
  return values.join(' OU ');
}

export function buildBannerText(
  activeTarget: string | null,
  blocks: ConditionBlock[],
  currentCat: string | null,
  currentValues: string[],
): string {
  if (!activeTarget) return '';
  const all = [...blocks];
  if (currentCat && currentValues.length > 0)
    all.push({ categoryId: currentCat, values: currentValues });
  const parts = all.map((b) => formatBlockText(b.categoryId, b.values));
  return `${activeTarget} : ${parts.length > 0 ? parts.join(' ET ') : '(SÉLECTIONNEZ UN CRITÈRE)'}`.toUpperCase();
}