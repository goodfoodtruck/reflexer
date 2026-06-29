import type { DraftGambit } from './GambitTypes';
import { formatBlockValue } from './filters/filterRegistry';
import { sortToFullLabel } from './sorts/sortRegistry';
import { ACTION_CATEGORIES } from './actionCatalog';

const SCOPE_LABEL: Record<string, string> = {
  SELF: 'Moi',
  ALLY: 'Allié',
  ENEMY: 'Ennemi',
};

export function formatConditionSummary(draft: DraftGambit): string {
  if (!draft.conditions || draft.conditions.length === 0) return '';
  const byScope = new Map<string, string[]>();
  for (const c of draft.conditions) {
    const list = byScope.get(c.scopeKind) ?? [];
    for (const v of c.blockValues) {
      list.push(formatBlockValue(c.filterTypeCategory, v));
    }
    byScope.set(c.scopeKind, list);
  }
  return Array.from(byScope.entries())
    .map(([scope, labels]) => `${SCOPE_LABEL[scope] ?? scope}: ${labels.join(', ')}`)
    .join(' · ');
}

export function formatIntentSummary(draft: DraftGambit): string {
  if (!draft.intentValue) return '';
  for (const cat of ACTION_CATEGORIES) {
    const found = cat.items.find((item) => item.id === draft.intentValue);
    if (found) return found.name;
  }
  return draft.intentValue;
}

export function formatTargetSummary(draft: DraftGambit): string {
  if (!draft.targetKind) return '';
  const kindLabel = SCOPE_LABEL[draft.targetKind] ?? draft.targetKind;
  if (draft.targetKind === 'SELF') return kindLabel;
  if (!draft.targetSort) return kindLabel;
  return `${kindLabel} · ${sortToFullLabel(draft.targetSort)}`;
}
