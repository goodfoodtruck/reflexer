import { useState, useMemo } from 'react';
import type { DraftGambit, Scope } from '../../GambitTypes';
import {
  categoriesForScope,
  type CategoryDefinition,
  type CategoryId,
  type BlockValue,
  type FilterEntry,
  type FilterOrGroup,
} from '@components/ui/gambit/filters/filterRegistry';

export type { FilterEntry, FilterOrGroup };

type PickerBatch = { categoryId: CategoryId; values: BlockValue[]; valuesOp: 'AND' | 'OR' };

interface UseTargetStepProps {
  draft: DraftGambit;
  updateDraft: (updates: Partial<DraftGambit>) => void;
}

export function useTargetStep({ draft, updateDraft }: UseTargetStepProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerCat, setPickerCat] = useState<CategoryId | null>(null);

  const filterCategories = useMemo<readonly CategoryDefinition[]>(
    () => (draft.targetKind ? categoriesForScope(draft.targetKind as Scope) : []),
    [draft.targetKind],
  );

  const handleSelectKind = (kind: Scope) => {
    if (kind === 'SELF') {
      updateDraft({ targetKind: 'SELF', targetSort: 'NEAREST', targetFilters: [] });
    } else {
      updateDraft({ targetKind: kind, targetFilters: [] });
    }
    setPickerOpen(false);
    setPickerCat(null);
  };

  const handleAddFilters = (batch: PickerBatch[]) => {
    const newGroups: FilterOrGroup[] = [];
    const newValuesOps: ('AND' | 'OR')[] = [];
    for (const { categoryId, values, valuesOp } of batch) {
      if (valuesOp === 'AND') {
        for (const value of values) {
          newGroups.push([{ categoryId, value }]);
          newValuesOps.push('OR');
        }
      } else {
        newGroups.push(values.map((value) => ({ categoryId, value })));
        newValuesOps.push('OR');
      }
    }
    if (newGroups.length === 0) return;
    const addedCount = newGroups.length;
    const newGroupOps: ('AND' | 'OR')[] = Array(
      Math.max(0, draft.targetFilters.length + addedCount - 1),
    ).fill('AND');
    // Preserve existing group ops
    for (let i = 0; i < draft.targetFilterGroupOps.length && i < newGroupOps.length; i++) {
      newGroupOps[i] = draft.targetFilterGroupOps[i]!;
    }
    updateDraft({
      targetFilters: [...draft.targetFilters, ...newGroups],
      targetFilterGroupOps: newGroupOps,
      targetFilterValuesOps: [...draft.targetFilterValuesOps, ...newValuesOps],
    });
    setPickerOpen(false);
    setPickerCat(null);
  };

  const handleRemoveFilter = (index: number) => {
    const newFilters = draft.targetFilters.filter((_, i) => i !== index);
    // Remove the group op for this pair: if removing group i, remove op at i-1 (between i-1 and i)
    // or op at i (between i and i+1), keeping the rest intact.
    const newGroupOps = draft.targetFilterGroupOps.filter((_, i) => i !== Math.max(0, index - 1) || (index === 0 && draft.targetFilterGroupOps.length > 0 ? false : true));
    const newValuesOps = draft.targetFilterValuesOps.filter((_, i) => i !== index);
    updateDraft({
      targetFilters: newFilters,
      targetFilterGroupOps: newGroupOps.slice(0, Math.max(0, newFilters.length - 1)),
      targetFilterValuesOps: newValuesOps,
    });
  };

  const handleToggleGroupOp = (index: number) => {
    const ops = [...draft.targetFilterGroupOps];
    ops[index] = (ops[index] ?? 'AND') === 'AND' ? 'OR' : 'AND';
    updateDraft({ targetFilterGroupOps: ops });
  };

  const handleToggleValuesOp = (index: number) => {
    const ops = [...draft.targetFilterValuesOps];
    ops[index] = (ops[index] ?? 'OR') === 'OR' ? 'AND' : 'OR';
    updateDraft({ targetFilterValuesOps: ops });
  };

  const handleSelectSort = (sortId: string) => {
    updateDraft({ targetSort: sortId });
  };

  const openPicker = () => {
    setPickerOpen(true);
    setPickerCat(null);
  };

  const closePicker = () => {
    setPickerOpen(false);
    setPickerCat(null);
  };

  return {
    pickerOpen,
    pickerCat,
    setPickerCat,
    filterCategories,
    handleSelectKind,
    handleAddFilters,
    handleRemoveFilter,
    handleToggleGroupOp,
    handleToggleValuesOp,
    handleSelectSort,
    openPicker,
    closePicker,
  };
}
