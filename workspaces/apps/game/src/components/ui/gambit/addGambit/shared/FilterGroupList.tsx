import type { BlockValue, CategoryId } from '@components/ui/gambit/filters/filterRegistry';
import { FilterChip } from './FilterChip';
import { OperatorButton } from './OperatorButton';

export interface FilterGroupItem {
  key: string;
  categoryId: CategoryId;
  values: BlockValue[];
  isNegated: boolean;
  valuesOp: 'AND' | 'OR';
  /** Opérateur reliant cet item au précédent. Absent pour le premier item. */
  precedingOp?: 'AND' | 'OR';
}

interface Props {
  items: FilterGroupItem[];
  emptyMessage?: React.ReactNode;
  onRemove: (index: number) => void;
  onTogglePrecedingOp?: (index: number) => void;
  onToggleValuesOp?: (index: number) => void;
  onToggleNegated?: (index: number) => void;
}

export function FilterGroupList({
  items,
  emptyMessage,
  onRemove,
  onTogglePrecedingOp,
  onToggleValuesOp,
  onToggleNegated,
}: Props) {
  if (items.length === 0) {
    return emptyMessage ? <>{emptyMessage}</> : null;
  }

  return (
    <div className="flex flex-col w-full gap-0">
      {items.map((item, i) => (
        <div key={item.key}>
          {i > 0 && item.precedingOp && (
            <div className="flex items-center gap-3 my-2">
              <div className="h-px flex-1 bg-slate-800/70" />
              {onTogglePrecedingOp
                ? <OperatorButton op={item.precedingOp} onClick={() => onTogglePrecedingOp(i)} />
                : <span className="text-[9px] font-black tracking-widest uppercase text-slate-500 px-1">ET</span>
              }
              <div className="h-px flex-1 bg-slate-800/70" />
            </div>
          )}

          <FilterChip
            categoryId={item.categoryId}
            values={item.values}
            isNegated={item.isNegated}
            valuesOp={item.valuesOp}
            onRemove={() => onRemove(i)}
            onToggleValuesOp={onToggleValuesOp ? () => onToggleValuesOp(i) : undefined}
            onToggleNegated={onToggleNegated ? () => onToggleNegated(i) : undefined}
          />
        </div>
      ))}
    </div>
  );
}
