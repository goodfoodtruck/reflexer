/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import type {
  ConditionBlock,
  DraftCondition,
  DraftGambit,
  SavedCondition
} from '../../../GambitTypes';
import { CRITERIA_DATA_CONDITION_STEP } from '../../../mockData';
import { buildBannerText } from '../utils';

export type ViewMode = 'SELECT_TARGET' | 'BUILD_CONDITION';

interface UseConditionStepProps {
  draft: DraftGambit;
  updateDraft: (updates: Partial<DraftGambit>) => void;
}

function initSavedConditions(draft: DraftGambit): SavedCondition[] {
  if (!draft.conditions || draft.conditions.length === 0) return [];

  const grouped: Record<string, ConditionBlock[]> = {};
  draft.conditions.forEach((c) => {
    if (!grouped[c.scopeKind]) grouped[c.scopeKind] = [];
    const raw = String(c.value);
    const values = raw.includes(',') ? raw.split(',') : [raw];
    grouped[c.scopeKind].push({ categoryId: c.filterType, values });
  });

  return Object.keys(grouped).map((targetId) => ({
    targetId,
    blocks: grouped[targetId]
  }));
}

function initConfiguredTargets(draft: DraftGambit): string[] {
  if (!draft.conditions) return [];
  return Array.from(new Set(draft.conditions.map((c) => c.scopeKind)));
}

function toScope(targetId: string): 'SELF' | 'ALLY' | 'ENEMY' {
  return (['SELF', 'ALLY', 'ENEMY'].includes(targetId) ? targetId : 'ENEMY') as
    | 'SELF'
    | 'ALLY'
    | 'ENEMY';
}

function blockToDraftCondition(
  block: ConditionBlock,
  targetId: string,
  index: number
): DraftCondition {
  let type: any = block.categoryId;
  let val: any = 0;

  if (block.categoryId === 'health') {
    type = 'HP_BELOW';
    const match = block.values[0]?.match(/\d+/);
    if (match) val = parseInt(match[0], 10);
  } else if (block.categoryId.includes('distance')) {
    type = 'IN_RANGE';
    val = block.values[0]?.includes('FAIBLE') ? 1 : block.values[0]?.includes('MOYENNE') ? 3 : 5;
  } else {
    val = block.values.join(',');
  }

  return {
    id: `temp-${targetId}-${block.categoryId}-${index}`,
    scopeKind: toScope(targetId),
    filterType: type,
    value: val
  };
}

export function useConditionStep({ draft, updateDraft }: UseConditionStepProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('SELECT_TARGET');
  const [activeTargetContext, setActiveTargetContext] = useState<string | null>(null);
  const [savedConditions, setSavedConditions] = useState<SavedCondition[]>(() =>
    initSavedConditions(draft)
  );
  const [configuredTargets, setConfiguredTargets] = useState<string[]>(() =>
    initConfiguredTargets(draft)
  );
  const [blocks, setBlocks] = useState<ConditionBlock[]>([]);
  const [currentCat, setCurrentCat] = useState<string | null>(null);
  const [currentValues, setCurrentValues] = useState<string[]>([]);

  const updateDraftRef = useRef(updateDraft);
  useEffect(() => {
    updateDraftRef.current = updateDraft;
  });

  useEffect(() => {
    const formatted: DraftCondition[] = savedConditions.flatMap((cond) =>
      cond.blocks.map((block, i) => blockToDraftCondition(block, cond.targetId, i))
    );
    updateDraftRef.current({ conditions: formatted });
  }, [savedConditions]);

  const catOptions = currentCat
    ? (CRITERIA_DATA_CONDITION_STEP.find((c) => c.id === currentCat)?.options ?? [])
    : [];

  const bannerText = buildBannerText(activeTargetContext, blocks, currentCat, currentValues);

  const handleSelectTarget = (id: string) => {
    const existing = savedConditions.find((c) => c.targetId === id);
    setBlocks(existing ? [...existing.blocks] : []);
    setCurrentCat(null);
    setCurrentValues([]);
    setActiveTargetContext(id);
    setViewMode('BUILD_CONDITION');
  };

  const handleToggleValue = (v: string) => {
    setCurrentValues((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const handleConfirmBlock = () => {
    if (!currentCat) return;
    setBlocks((prev) => [...prev, { categoryId: currentCat, values: currentValues }]);
    setCurrentCat(null);
    setCurrentValues([]);
  };

  const handleRemoveBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveCurrentValue = (v: string) => {
    setCurrentValues((prev) => prev.filter((x) => x !== v));
  };

  const handleRemoveTarget = (targetId: string) => {
    setSavedConditions((prev) => prev.filter((c) => c.targetId !== targetId));
    setConfiguredTargets((prev) => prev.filter((t) => t !== targetId));
  };

  const handleSaveConditionGroup = () => {
    const final = [...blocks];
    if (currentCat && currentValues.length > 0)
      final.push({ categoryId: currentCat, values: currentValues });

    if (activeTargetContext) {
      if (final.length > 0) {
        setSavedConditions((prev) => [
          ...prev.filter((c) => c.targetId !== activeTargetContext),
          { targetId: activeTargetContext, blocks: final }
        ]);
        setConfiguredTargets((prev) =>
          prev.includes(activeTargetContext) ? prev : [...prev, activeTargetContext]
        );
      } else {
        setSavedConditions((prev) => prev.filter((c) => c.targetId !== activeTargetContext));
        setConfiguredTargets((prev) => prev.filter((t) => t !== activeTargetContext));
      }
    }

    setBlocks([]);
    setCurrentCat(null);
    setCurrentValues([]);
    setViewMode('SELECT_TARGET');
  };

  const handleCancelBuild = () => setViewMode('SELECT_TARGET');

  const canSave = blocks.length > 0 || currentValues.length > 0;

  return {
    viewMode,
    activeTargetContext,
    configuredTargets,
    blocks,
    currentCat,
    currentValues,
    catOptions,
    bannerText,
    canSave,
    handleSelectTarget,
    handleToggleValue,
    handleConfirmBlock,
    handleSaveConditionGroup,
    handleCancelBuild,
    setCurrentCat,
    handleRemoveBlock,
    handleRemoveCurrentValue,
    handleRemoveTarget
  };
}
