import { Fragment } from 'react';
import type { FilterOrGroup } from '../../../GambitTypes';
import { FilterChip } from '../../shared/FilterChip';
import { OperatorButton } from '../../shared/OperatorButton';

interface Props {
  filters: FilterOrGroup[];
  groupOps?: ('AND' | 'OR')[];
  valuesOps?: ('AND' | 'OR')[];
  groupNegated?: boolean[];
  onRemove: (index: number) => void;
  onToggleGroupOp?: (index: number) => void;
  onToggleValuesOp?: (index: number) => void;
  onToggleGroupNegated?: (index: number) => void;
}

export function TargetFilterList({
  filters,
  groupOps = [],
  valuesOps = [],
  groupNegated = [],
  onRemove,
  onToggleGroupOp,
  onToggleValuesOp,
  onToggleGroupNegated,
}: Props) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((group, gi) => {
        const firstEntry = group[0];
        if (!firstEntry) return null;

        const interGroupOp = groupOps[gi - 1] ?? 'AND';
        const valuesOp     = valuesOps[gi]    ?? 'OR';
        const isNegated    = groupNegated[gi]  ?? false;

        return (
          <Fragment key={gi}>
            {gi > 0 && (
              onToggleGroupOp
                ? <OperatorButton op={interGroupOp} onClick={() => onToggleGroupOp(gi - 1)} />
                : <span className="px-2.5 py-1 rounded-md border border-sky-500/40 bg-sky-500/10 text-[9px] font-black uppercase tracking-widest text-sky-400">ET</span>
            )}

            <FilterChip
              categoryId={firstEntry.categoryId}
              values={group.map((e) => e.value)}
              isNegated={isNegated}
              valuesOp={valuesOp}
              onRemove={() => onRemove(gi)}
              onToggleValuesOp={onToggleValuesOp ? () => onToggleValuesOp(gi) : undefined}
              onToggleNegated={onToggleGroupNegated ? () => onToggleGroupNegated(gi) : undefined}
            />
          </Fragment>
        );
      })}
    </div>
  );
}
