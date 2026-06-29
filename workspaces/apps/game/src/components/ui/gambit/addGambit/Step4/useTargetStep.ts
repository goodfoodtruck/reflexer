import { useState, useMemo } from 'react';
import type { DraftGambit, Scope } from '@components/ui/gambit/GambitTypes';
import {
  categoriesForScope,
  formatBlockValue,
  type CategoryDefinition,
  type CategoryId,
  type BlockValue,
  type FilterEntry,
  type FilterOrGroup,
} from '@components/ui/gambit/filters/filterRegistry';

export type { FilterEntry, FilterOrGroup };

export type ConfiguredTarget = { kind: Scope };

export function formatOrGroup(group: FilterOrGroup): string {
  return group.map((e) => formatBlockValue(e.categoryId, e.value)).join(' OU ');
}

type PickerBatch = { categoryId: CategoryId; values: BlockValue[]; valuesOp: 'AND' | 'OR' };

interface Props {
  draft: DraftGambit;
  updateDraft: (updates: Partial<DraftGambit>) => void;
}

function buildGroupsFromBatch(batch: PickerBatch[]): { groups: FilterOrGroup[]; valuesOps: ('AND' | 'OR')[] } {
  const groups: FilterOrGroup[] = [];
  const valuesOps: ('AND' | 'OR')[] = [];

  for (const { categoryId, values, valuesOp } of batch) {
    if (valuesOp === 'AND') {
      for (const value of values) {
        groups.push([{ categoryId, value }]);
        valuesOps.push('OR');
      }
    } else {
      groups.push(values.map((value) => ({ categoryId, value })));
      valuesOps.push('OR');
    }
  }

  return { groups, valuesOps };
}

function rebuildGroupOps(
  existingOps: ('AND' | 'OR')[],
  _previousGroupCount: number,
  totalGroupCount: number,
): ('AND' | 'OR')[] {
  const newOps: ('AND' | 'OR')[] = Array(Math.max(0, totalGroupCount - 1)).fill('AND');
  for (let i = 0; i < existingOps.length && i < newOps.length; i++) {
    newOps[i] = existingOps[i]!;
  }
  return newOps;
}

function removeAtIndex<T>(arr: T[], index: number): T[] {
  return arr.filter((_, i) => i !== index);
}

function removeGroupOpForRemovedItem(ops: ('AND' | 'OR')[], removedIndex: number, totalAfter: number): ('AND' | 'OR')[] {
  const opIndexToRemove = Math.max(0, removedIndex - 1);
  const filtered = ops.filter((_, i) => i !== opIndexToRemove || (removedIndex === 0 && ops.length > 0 ? false : true));
  return filtered.slice(0, Math.max(0, totalAfter - 1));
}

function toggleArrayEntry<T>(arr: T[], index: number, toggle: (current: T) => T): T[] {
  const next = [...arr];
  next[index] = toggle(next[index] as T);
  return next;
}

export function useTargetStep({ draft, updateDraft }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerCat,  setPickerCat]  = useState<CategoryId | null>(null);

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
    const { groups: newGroups, valuesOps: newValuesOps } = buildGroupsFromBatch(batch);
    if (newGroups.length === 0) return;

    const totalGroupCount = draft.targetFilters.length + newGroups.length;
    const newGroupOps = rebuildGroupOps(draft.targetFilterGroupOps, draft.targetFilters.length, totalGroupCount);

    updateDraft({
      targetFilters:           [...draft.targetFilters, ...newGroups],
      targetFilterGroupOps:    newGroupOps,
      targetFilterValuesOps:   [...draft.targetFilterValuesOps, ...newValuesOps],
      targetFilterGroupNegated: [...draft.targetFilterGroupNegated, ...Array(newGroups.length).fill(false)],
    });
    setPickerOpen(false);
    setPickerCat(null);
  };

  const handleRemoveFilter = (index: number) => {
    const newFilters = removeAtIndex(draft.targetFilters, index);
    updateDraft({
      targetFilters:            newFilters,
      targetFilterGroupOps:     removeGroupOpForRemovedItem(draft.targetFilterGroupOps, index, newFilters.length),
      targetFilterValuesOps:    removeAtIndex(draft.targetFilterValuesOps, index),
      targetFilterGroupNegated: removeAtIndex(draft.targetFilterGroupNegated, index),
    });
  };

  const handleToggleGroupOp = (index: number) => {
    updateDraft({
      targetFilterGroupOps: toggleArrayEntry(
        draft.targetFilterGroupOps,
        index,
        (op) => ((op ?? 'AND') === 'AND' ? 'OR' : 'AND'),
      ),
    });
  };

  const handleToggleValuesOp = (index: number) => {
    updateDraft({
      targetFilterValuesOps: toggleArrayEntry(
        draft.targetFilterValuesOps,
        index,
        (op) => ((op ?? 'OR') === 'OR' ? 'AND' : 'OR'),
      ),
    });
  };

  const handleToggleGroupNegated = (index: number) => {
    updateDraft({
      targetFilterGroupNegated: toggleArrayEntry(
        draft.targetFilterGroupNegated,
        index,
        (negated) => !(negated ?? false),
      ),
    });
  };

  const handleSelectSort = (sortId: string) => updateDraft({ targetSort: sortId });

  const openPicker  = () => { setPickerOpen(true);  setPickerCat(null); };
  const closePicker = () => { setPickerOpen(false); setPickerCat(null); };

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
    handleToggleGroupNegated,
    handleSelectSort,
    openPicker,
    closePicker,
  };
}
