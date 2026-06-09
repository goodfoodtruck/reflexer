/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import type { DraftGambit } from '../../GambitTypes';
import { FILTER_CATEGORIES } from '../../mockData';

export type InternalStep = 1 | 2 | 3;

export type FilterBlock = { categoryId: string; values: string[] };
export type ConfiguredTarget = { kind: string; filters: FilterBlock[]; sortVal: string | null };

interface UseTargetStepProps {
  draft: DraftGambit;
  updateDraft: (updates: Partial<DraftGambit>) => void;
}

export function formatBlockText(catId: string, values: string[]): string {
  if (values.length === 0) return '';
  return catId === 'type' ? `DE TYPE ${values.join(' OU ')}` : values.join(' OU ');
}

export function useTargetStep({ draft, updateDraft }: UseTargetStepProps) {
  const [internalStep, setInternalStep] = useState<InternalStep>(1);

  const [configuredTarget, setConfiguredTarget] = useState<ConfiguredTarget | null>(() => {
    if (draft.targetKind && draft.targetSort) {
      return {
        kind: draft.targetKind,
        filters: draft.targetFilters.map((f) => ({ categoryId: f.categoryId, values: f.values })),
        sortVal: draft.targetSort
      };
    }
    return null;
  });

  const [localKind, setLocalKind] = useState<string | null>(draft.targetKind || null);
  const [sortVal, setSortVal] = useState<string | null>(draft.targetSort || null);
  const [filterBlocks, setFilterBlocks] = useState<FilterBlock[]>([]);
  const [currentFilterCat, setCurrentFilterCat] = useState<string | null>(null);
  const [currentFilterVals, setCurrentFilterVals] = useState<string[]>([]);
  const [sortCat, setSortCat] = useState<string | null>(null);

  const catOptions = currentFilterCat
    ? (FILTER_CATEGORIES.find((c) => c.id === currentFilterCat)?.options ?? [])
    : [];

  const handleSelectKind = (kind: string) => {
    setLocalKind(kind);
    setFilterBlocks([]);
    setSortVal(null);
    setInternalStep(2);
  };

  const handleToggleFilterVal = (val: string) => {
    setCurrentFilterVals((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
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
    setConfiguredTarget({ kind: localKind, filters: filterBlocks, sortVal });
    setInternalStep(1);
    updateDraft({
      targetKind: localKind as any,
      targetSort: sortVal || 'NEAREST',
      targetFilters: filterBlocks
    });
  };

  const handleReset = () => {
    setConfiguredTarget(null);
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
    catOptions,
    handleSelectKind,
    handleToggleFilterVal,
    handleConfirmFilterBlock,
    handleGoToSort,
    handleSave,
    handleReset
  };
}
