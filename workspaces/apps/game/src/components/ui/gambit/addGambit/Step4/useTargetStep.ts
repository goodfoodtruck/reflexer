import { useState } from 'react';
import type { DraftGambit } from '../../GambitTypes';
import type { FilterEntry, FilterOrGroup } from '../../filters/filterRegistry';
import { formatBlockValue, sameBlockValue, type CategoryId } from '@components/ui/gambit/filters/filterRegistry';
import { sortLabelToSort, sortToLabel } from '../../gambit.adapter';

export type InternalStep = 1 | 2 | 3;

export type ConfiguredTarget = { kind: string; filters: FilterOrGroup[]; sortVal: string | null };

export type { FilterEntry, FilterOrGroup };

interface UseTargetStepProps {
  draft: DraftGambit;
  updateDraft: (updates: Partial<DraftGambit>) => void;
}

/** Formate un groupe OU multi-catégories pour l'affichage. */
export function formatOrGroup(group: FilterOrGroup): string {
  if (group.length === 0) return '';
  return group.map((e) => formatBlockValue(e.categoryId, e.value)).join(' OU ');
}

export function useTargetStep({ draft, updateDraft }: UseTargetStepProps) {
  const [internalStep, setInternalStep] = useState<InternalStep>(1);

  const [configuredTarget, setConfiguredTarget] = useState<ConfiguredTarget | null>(() => {
    if (draft.targetKind && draft.targetSort) {
      return {
        kind: draft.targetKind,
        filters: draft.targetFilters,
        sortVal: sortToLabel(draft.targetSort),
      };
    }
    return null;
  });

  const [localKind, setLocalKind] = useState<string | null>(draft.targetKind || null);
  const [sortVal, setSortVal] = useState<string | null>(
    draft.targetSort ? sortToLabel(draft.targetSort) : null,
  );
  /** Groupes OR confirmés (reliés par ET). */
  const [filterBlocks, setFilterBlocks] = useState<FilterOrGroup[]>([]);
  /** Catégorie actuellement sélectionnée dans le panneau central (affichage des valeurs à droite). */
  const [currentFilterCat, setCurrentFilterCat] = useState<CategoryId | null>(null);
  /** Entrées du groupe OR en cours de construction (multi-catégories, pas encore confirmées). */
  const [currentBlockEntries, setCurrentBlockEntries] = useState<FilterEntry[]>([]);
  const [sortCat, setSortCat] = useState<string | null>(null);

  const handleSelectKind = (kind: string) => {
    setLocalKind(kind);
    setFilterBlocks([]);
    setCurrentBlockEntries([]);
    setSortVal(null);

    if (kind === 'SELF') {
      setConfiguredTarget({ kind, filters: [], sortVal: null });
      setInternalStep(1);
      updateDraft({ targetKind: 'SELF', targetSort: 'NEAREST', targetFilters: [] });
      return;
    }

    setInternalStep(2);
  };

  /**
   * Toggle une valeur dans le groupe OR en cours.
   * La valeur est associée à sa catégorie via FilterEntry — pas de confusion cross-cat.
   */
  const handleToggleFilterVal = (val: BlockValue) => {
    if (!currentFilterCat) return;
    const cat = currentFilterCat;
    setCurrentBlockEntries((prev) => {
      const idx = prev.findIndex(
        (e) => e.categoryId === cat && sameBlockValue(e.value, val),
      );
      if (idx >= 0) return prev.filter((_, i) => i !== idx);
      return [...prev, { categoryId: cat, value: val }];
    });
  };

  /**
   * "+" : confirme le groupe OR en cours comme nouveau bloc ET.
   * La catégorie sélectionnée reste active (pas de reset).
   */
  const handleConfirmFilterBlock = () => {
    if (currentBlockEntries.length === 0) return;
    setFilterBlocks((prev) => [...prev, currentBlockEntries]);
    setCurrentBlockEntries([]);
    // currentFilterCat intentionnellement préservé
  };

  const handleRemoveFilterBlock = (index: number) => {
    setFilterBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveFilter = (index: number) => {
    if (!configuredTarget) return;
    const updated = {
      ...configuredTarget,
      filters: configuredTarget.filters.filter((_, i) => i !== index),
    };
    setConfiguredTarget(updated);
    updateDraft({ targetFilters: updated.filters });
  };

  const handleGoToSort = () => {
    if (currentBlockEntries.length > 0) {
      setFilterBlocks((prev) => [...prev, currentBlockEntries]);
      setCurrentBlockEntries([]);
    }
    setInternalStep(3);
  };

  const handleSave = () => {
    if (!localKind) return;
    const saved: ConfiguredTarget = { kind: localKind, filters: filterBlocks, sortVal };
    setConfiguredTarget(saved);
    setInternalStep(1);
    updateDraft({
      targetKind: localKind as DraftGambit['targetKind'],
      targetSort: sortLabelToSort(sortVal),
      targetFilters: filterBlocks,
    });
  };

  const handleReset = () => {
    setConfiguredTarget(null);
    setLocalKind(null);
    setSortVal(null);
    setFilterBlocks([]);
    setCurrentBlockEntries([]);
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
    currentBlockEntries,
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

// Re-export de BlockValue pour les consommateurs du hook
export type { BlockValue } from '@components/ui/gambit/filters/filterRegistry';
