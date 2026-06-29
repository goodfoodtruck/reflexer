import type { FilterOrGroup } from '@components/ui/gambit/GambitTypes';
import { FilterGroupList, type FilterGroupItem } from '@components/ui/gambit/addGambit/shared/FilterGroupList';

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
    .map((group, gi): FilterGroupItem | null => {
      const firstEntry = group[0];
      if (!firstEntry) return null;
      return {
        key: String(gi),
        categoryId: firstEntry.categoryId,
        values: group.map((e) => e.value),
        isNegated: groupNegated[gi] ?? false,
        valuesOp: valuesOps[gi] ?? 'OR',
        ...(gi > 0 ? { precedingOp: groupOps[gi - 1] ?? 'AND' } : {}),
      };
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
