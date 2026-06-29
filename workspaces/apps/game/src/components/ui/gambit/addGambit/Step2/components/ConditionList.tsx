import type { DraftCondition, Scope } from '@components/ui/gambit/GambitTypes';
import { FilterGroupList, type FilterGroupItem } from '@components/ui/gambit/addGambit/shared/FilterGroupList';

const SCOPE_LABEL: Record<Scope, string> = {
  SELF:  'Moi',
  ALLY:  'Allié',
  ENEMY: 'Ennemi',
};

interface Props {
  conditions: DraftCondition[];
  scope: Scope;
  onRemove: (id: string) => void;
  onToggleOperator?: (id: string) => void;
  onToggleValuesOperator?: (id: string) => void;
  onToggleNegated?: (id: string) => void;
}

export function ConditionList({
  conditions,
  scope,
  onRemove,
  onToggleOperator,
  onToggleValuesOperator,
  onToggleNegated,
}: Props) {
  const items: FilterGroupItem[] = conditions.map((cond, i) => ({
    key: cond.id,
    categoryId: cond.filterTypeCategory,
    values: cond.blockValues,
    isNegated: cond.negated ?? false,
    valuesOp: cond.valuesOperator ?? 'OR',
    precedingOp: i > 0 ? (conditions[i - 1]!.scopeOperator ?? 'AND') : undefined,
  }));

  const emptyMessage = (
    <p className="text-[10px] text-slate-600 italic py-2">
      Aucune condition pour{' '}
      <span className="text-slate-400 not-italic font-semibold">{SCOPE_LABEL[scope]}</span>{' '}
      — critère toujours satisfait.
    </p>
  );

  return (
    <FilterGroupList
      items={items}
      emptyMessage={emptyMessage}
      onRemove={(i) => onRemove(conditions[i]!.id)}
      onTogglePrecedingOp={onToggleOperator ? (i) => onToggleOperator(conditions[i - 1]!.id) : undefined}
      onToggleValuesOp={onToggleValuesOperator ? (i) => onToggleValuesOperator(conditions[i]!.id) : undefined}
      onToggleNegated={onToggleNegated ? (i) => onToggleNegated(conditions[i]!.id) : undefined}
    />
  );
}
