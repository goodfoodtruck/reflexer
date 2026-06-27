import type { FilterOrGroup } from '../../../GambitTypes';
import { FilterGroupList, type FilterGroupItem } from '../../shared/FilterGroupList';

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
  const items: FilterGroupItem[] = filters
    .map((group, gi) => {
      const firstEntry = group[0];
      if (!firstEntry) return null;
      return {
        key: String(gi),
        categoryId: firstEntry.categoryId,
        values: group.map((e) => e.value),
        isNegated: groupNegated[gi] ?? false,
        valuesOp: valuesOps[gi] ?? 'OR',
        precedingOp: gi > 0 ? (groupOps[gi - 1] ?? 'AND') : undefined,
      } satisfies FilterGroupItem;
    })
    .filter((item): item is FilterGroupItem => item !== null);

  return (
    <FilterGroupList
      items={items}
      onRemove={onRemove}
      onTogglePrecedingOp={onToggleGroupOp ? (i) => onToggleGroupOp(i - 1) : undefined}
      onToggleValuesOp={onToggleValuesOp}
      onToggleNegated={onToggleGroupNegated}
    />
  );
}
