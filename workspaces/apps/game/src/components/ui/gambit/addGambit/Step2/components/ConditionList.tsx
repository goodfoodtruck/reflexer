import { Fragment } from 'react';
import type { DraftCondition, Scope } from '../../../GambitTypes';
import { FilterChip } from '../../shared/FilterChip';
import { OperatorButton } from '../../shared/OperatorButton';

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
  if (conditions.length === 0) {
    return (
      <p className="text-[10px] text-slate-600 italic py-2">
        Aucune condition pour{' '}
        <span className="text-slate-400 not-italic font-semibold">{SCOPE_LABEL[scope]}</span>{' '}
        — critère toujours satisfait.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {conditions.map((cond, i) => {
        const prevCondition = conditions[i - 1];
        const interGroupOp = prevCondition?.scopeOperator ?? 'AND';

        return (
          <Fragment key={cond.id}>
            {i > 0 && (
              onToggleOperator
                ? <OperatorButton op={interGroupOp} onClick={() => onToggleOperator(prevCondition!.id)} />
                : <span className="text-[9px] font-black tracking-widest uppercase text-slate-600 px-1">ET</span>
            )}

            <FilterChip
              categoryId={cond.filterTypeCategory}
              values={cond.blockValues}
              isNegated={cond.negated ?? false}
              valuesOp={cond.valuesOperator ?? 'OR'}
              onRemove={() => onRemove(cond.id)}
              onToggleValuesOp={onToggleValuesOperator ? () => onToggleValuesOperator(cond.id) : undefined}
              onToggleNegated={onToggleNegated ? () => onToggleNegated(cond.id) : undefined}
            />
          </Fragment>
        );
      })}
    </div>
  );
}
