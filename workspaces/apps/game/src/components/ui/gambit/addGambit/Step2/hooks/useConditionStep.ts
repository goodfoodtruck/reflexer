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
import { FILTER_CATEGORIES } from '../../../gambitEditorOptions';
import { buildBannerText } from '../utils';

export type ViewMode = 'SELECT_TARGET' | 'BUILD_CONDITION';

interface UseConditionStepProps {
  draft: DraftGambit;
  updateDraft: (updates: Partial<DraftGambit>) => void;
}

function draftConditionToBlock(c: DraftCondition): ConditionBlock {
  switch (c.filterType) {
    case 'HP_BELOW':     return { categoryId: 'health', values: [`PV < ${c.value}%`] };
    case 'HP_ABOVE':     return { categoryId: 'health', values: [`PV > ${c.value}%`] };
    case 'ARMOR_BELOW':  return { categoryId: 'armor',  values: [`ARMURE < ${c.value}%`] };
    case 'ARMOR_ABOVE':  return { categoryId: 'armor',  values: [`ARMURE > ${c.value}%`] };
    case 'ENERGY_BELOW': return { categoryId: 'energy', values: [`ÉNERGIE < ${c.value}%`] };
    case 'ENERGY_ABOVE': return { categoryId: 'energy', values: [`ÉNERGIE > ${c.value}%`] };

    case 'CHARACTER_IN_RANGE_OF_ANOTHER':
    case 'ENEMY_IN_RANGE_OF_CHARACTER':
      return { categoryId: 'in_range_of_ally', values: [rangeToLabel(Number(c.value))] };

    case 'CHARACTER_IN_RANGE_OF_ENEMY':
    case 'ENEMY_IN_RANGE_OF_ANOTHER':
      return { categoryId: 'in_range_of_enemy', values: [rangeToLabel(Number(c.value))] };

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

const RANGE_RELATION_MAP: Record<string, Record<string, DraftCondition['filterType']>> = {
  ALLY: {
    'in_range_of_ally':  'CHARACTER_IN_RANGE_OF_ANOTHER',
    'in_range_of_enemy': 'CHARACTER_IN_RANGE_OF_ENEMY'
  },
  ENEMY: {
    'in_range_of_ally':  'ENEMY_IN_RANGE_OF_CHARACTER',
    'in_range_of_enemy': 'ENEMY_IN_RANGE_OF_ANOTHER'
  }
};

function blockToDraftCondition(
  block: ConditionBlock,
  targetId: string,
  index: number
): DraftCondition | null {
  let filterType: DraftCondition['filterType'];
  let value: number | string;

  const parseThreshold = (label: string): { above: boolean; n: number } => ({
    above: label.includes('>'),
    n: parseInt(label.match(/\d+/)?.[0] ?? '0', 10)
  });

  const scope = toScope(targetId);

  switch (block.categoryId) {
    case 'health': {
      const { above, n } = parseThreshold(block.values[0] ?? '');
      filterType = above ? 'HP_ABOVE' : 'HP_BELOW';
      value = n;
      break;
    }
    case 'armor': {
      const { above, n } = parseThreshold(block.values[0] ?? '');
      filterType = above ? 'ARMOR_ABOVE' : 'ARMOR_BELOW';
      value = n;
      break;
    }
    case 'energy': {
      const { above, n } = parseThreshold(block.values[0] ?? '');
      filterType = above ? 'ENERGY_ABOVE' : 'ENERGY_BELOW';
      value = n;
      break;
    }
    case 'distance_character':
    case 'distance_enemy': {
      filterType = 'IN_RANGE';
      value = rangeLabelToRange(block.values[0] ?? '');
      break;
    }
    case 'in_range_of_ally':
    case 'in_range_of_enemy': {
      const resolved = RANGE_RELATION_MAP[scope]?.[block.categoryId];
      if (!resolved) return null;
      filterType = resolved;
      value = rangeLabelToRange(block.values[0] ?? '');
      break;
    }
    case 'status': {
      filterType = 'HAS_PASSIVE';
      value = block.values.map(statusLabelToPassiveId).filter(Boolean).join(',');
      break;
    }
    default:
      return null;
  }

  return {
    id: `temp-${targetId}-${block.categoryId}-${index}`,
    scopeKind: scope,
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
    ? (FILTER_CATEGORIES.find((c) => c.id === currentCat)?.options ?? [])
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
