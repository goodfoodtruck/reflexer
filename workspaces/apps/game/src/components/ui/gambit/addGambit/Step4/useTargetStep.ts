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
    for (const { categoryId, values, valuesOp } of batch) {
      if (valuesOp === 'AND') {
        for (const value of values) {
          newGroups.push([{ categoryId, value }]);
        }
      } else {
        newGroups.push(values.map((value) => ({ categoryId, value })));
      }
    }
    if (newGroups.length === 0) return;
    updateDraft({ targetFilters: [...draft.targetFilters, ...newGroups] });
    setPickerOpen(false);
    setPickerCat(null);
  };

  const handleRemoveFilter = (index: number) => {
    updateDraft({ targetFilters: draft.targetFilters.filter((_, i) => i !== index) });
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
    handleSelectSort,
    openPicker,
    closePicker,
  };
}
