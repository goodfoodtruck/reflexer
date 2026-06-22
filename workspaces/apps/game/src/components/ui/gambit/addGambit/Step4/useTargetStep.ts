import { useState } from 'react';
import type { DraftGambit, ConditionBlock } from '../../GambitTypes';
import { sortLabelToSort, sortToLabel } from '../../gambit.adapter';
import {
  formatBlockValue,
  sameBlockValue,
  type BlockValue,
  type CategoryId,
} from '@components/ui/gambit/filters/filterRegistry';

export type InternalStep = 1 | 2 | 3;

export type FilterBlock = ConditionBlock;
export type ConfiguredTarget = { kind: string; filters: FilterBlock[]; sortVal: string | null };

interface UseTargetStepProps {
  draft: DraftGambit;
  updateDraft: (updates: Partial<DraftGambit>) => void;
}

export function formatBlockText(categoryId: CategoryId, values: BlockValue[]): string {
  if (values.length === 0) return '';
  const labels = values.map((v) => formatBlockValue(categoryId, v));
  return labels.join(' OU ');
}

export function useTargetStep({ draft, updateDraft }: UseTargetStepProps) {
  const [internalStep, setInternalStep] = useState<InternalStep>(1);

  const [configuredTarget, setConfiguredTarget] = useState<ConfiguredTarget | null>(() => {
    if (draft.targetKind && draft.targetSort) {
      return {
        kind: draft.targetKind,
        filters: draft.targetFilters,
        sortVal: sortToLabel(draft.targetSort)
      };
    }
    return null;
  });

  const [localKind, setLocalKind] = useState<string | null>(draft.targetKind || null);
  const [sortVal, setSortVal] = useState<string | null>(
    draft.targetSort ? sortToLabel(draft.targetSort) : null
  );
  const [filterBlocks, setFilterBlocks] = useState<FilterBlock[]>([]);
  const [currentFilterCat, setCurrentFilterCat] = useState<CategoryId | null>(null);
  const [currentFilterVals, setCurrentFilterVals] = useState<BlockValue[]>([]);
  const [sortCat, setSortCat] = useState<string | null>(null);

  const handleSelectKind = (kind: string) => {
    setLocalKind(kind);
    setFilterBlocks([]);
    setSortVal(null);

    if (kind === 'SELF') {
      setConfiguredTarget({ kind, filters: [], sortVal: null });
      setInternalStep(1);
      updateDraft({ targetKind: 'SELF', targetSort: 'NEAREST', targetFilters: [] });
      return;
    }

    setInternalStep(2);
  };

  const handleToggleFilterVal = (val: BlockValue) => {
    setCurrentFilterVals((prev) =>
      prev.some((v) => sameBlockValue(v, val))
        ? prev.filter((v) => !sameBlockValue(v, val))
        : [...prev, val]
    );
  };

  const handleConfirmFilterBlock = () => {
    if (!currentFilterCat || currentFilterVals.length === 0) return;
    setFilterBlocks((prev) => [
      ...prev,
      { categoryId: currentFilterCat, values: currentFilterVals }
    ]);
    setCurrentFilterCat(null);
    setCurrentFilterVals([]);
  };

  const handleRemoveFilterBlock = (index: number) => {
    setFilterBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveFilter = (index: number) => {
    if (!configuredTarget) return;
    const updated = {
      ...configuredTarget,
      filters: configuredTarget.filters.filter((_, i) => i !== index)
    };
    setConfiguredTarget(updated);
    updateDraft({ targetFilters: updated.filters });
  };

  const handleGoToSort = () => {
    if (currentFilterCat && currentFilterVals.length > 0) {
      setFilterBlocks((prev) => [
        ...prev,
        { categoryId: currentFilterCat, values: currentFilterVals }
      ]);
    }
    setInternalStep(3);
  };

  const handleSave = () => {
    if (!localKind) return;
    const saved = { kind: localKind, filters: filterBlocks, sortVal };
    setConfiguredTarget(saved);
    setInternalStep(1);
    updateDraft({
      targetKind: localKind as DraftGambit['targetKind'],
      targetSort: sortLabelToSort(sortVal),
      targetFilters: filterBlocks
    });
  };

  const handleReset = () => {
    setConfiguredTarget(null);
    setLocalKind(null);
    setSortVal(null);
    setFilterBlocks([]);
    updateDraft({ targetKind: 'ENEMY', targetSort: '' });
  };

  return {
    internalStep,
    setInternalStep,
    configuredTarget,
    localKind,
    sortVal,
    setSortVal,
    filterBlocks,
    currentFilterCat,
    setCurrentFilterCat,
    currentFilterVals,
    sortCat,
    setSortCat,
    handleSelectKind,
    handleToggleFilterVal,
    handleConfirmFilterBlock,
    handleRemoveFilterBlock,
    handleGoToSort,
    handleSave,
    handleReset,
    handleRemoveFilter,
  };
}