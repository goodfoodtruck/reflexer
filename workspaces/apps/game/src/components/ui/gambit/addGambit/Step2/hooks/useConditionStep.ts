import { useState, useEffect, useRef, useMemo } from 'react';
import type {
  ConditionBlock,
  DraftCondition,
  DraftGambit,
  SavedCondition
} from '../../../GambitTypes';
import {
  passiveIdToStatusLabel,
  rangeLabelToRange,
  rangeToLabel,
  statusLabelToPassiveId
} from '../../../gambit.adapter';
import { CRITERIA_DATA_CONDITION_STEP } from '../../../gambitEditorOptions';
import { buildBannerText } from '../utils';

export type ViewMode = 'SELECT_TARGET' | 'BUILD_CONDITION';

interface UseConditionStepProps {
  draft: DraftGambit;
  updateDraft: (updates: Partial<DraftGambit>) => void;
}

function draftConditionToBlock(c: DraftCondition): ConditionBlock {
  switch (c.filterType) {
    case 'HP_BELOW':
      return { categoryId: 'health', values: [`PV < ${c.value}%`] };
    case 'HP_ABOVE':
      return { categoryId: 'health', values: [`PV > ${c.value}%`] };
    case 'IN_RANGE':
      return {
        categoryId: c.scopeKind === 'ALLY' ? 'distance_character' : 'distance_enemy',
        values: [rangeToLabel(Number(c.value))]
      };
    case 'HAS_PASSIVE':
      return {
        categoryId: 'status',
        values: String(c.value).split(',').filter(Boolean).map(passiveIdToStatusLabel)
      };
  }
}

function initSavedConditions(draft: DraftGambit): SavedCondition[] {
  if (!draft.conditions || draft.conditions.length === 0) return [];

  const grouped: Record<string, ConditionBlock[]> = {};
  draft.conditions.forEach((c) => {
    if (!grouped[c.scopeKind]) grouped[c.scopeKind] = [];
    grouped[c.scopeKind].push(draftConditionToBlock(c));
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
): DraftCondition | null {
  let filterType: DraftCondition['filterType'];
  let value: number | string;

  if (block.categoryId === 'health') {
    const label = block.values[0] ?? '';
    filterType = label.includes('>') ? 'HP_ABOVE' : 'HP_BELOW';
    value = parseInt(label.match(/\d+/)?.[0] ?? '0', 10);
  } else if (block.categoryId.includes('distance')) {
    filterType = 'IN_RANGE';
    value = rangeLabelToRange(block.values[0] ?? '');
  } else if (block.categoryId === 'status') {
    filterType = 'HAS_PASSIVE';
    value = block.values
      .map(statusLabelToPassiveId)
      .filter(Boolean)
      .join(',');
  } else {
    return null;
  }

  return {
    id: `temp-${targetId}-${block.categoryId}-${index}`,
    scopeKind: toScope(targetId),
    filterType,
    value
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

  const effectiveConditions = useMemo<SavedCondition[]>(() => {
    if (viewMode !== 'BUILD_CONDITION' || !activeTargetContext) return savedConditions;

    const pendingBlocks = [...blocks];
    if (currentCat && currentValues.length > 0) {
      pendingBlocks.push({ categoryId: currentCat, values: currentValues });
    }
    if (pendingBlocks.length === 0) return savedConditions;

    return [
      ...savedConditions.filter((c) => c.targetId !== activeTargetContext),
      { targetId: activeTargetContext, blocks: pendingBlocks }
    ];
  }, [viewMode, savedConditions, activeTargetContext, blocks, currentCat, currentValues]);

  useEffect(() => {
    const formatted: DraftCondition[] = effectiveConditions.flatMap((cond) =>
      cond.blocks
        .map((block, i) => blockToDraftCondition(block, cond.targetId, i))
        .filter((c): c is DraftCondition => c !== null)
    );
    updateDraftRef.current({ conditions: formatted });
  }, [effectiveConditions]);

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
