import { useState, useEffect, useRef, useMemo } from 'react';
import type {
  ConditionBlock,
  DraftCondition,
  DraftGambit,
  SavedCondition,
} from '../../../GambitTypes';
import { buildBannerText } from '../utils';
import {
  categoriesForScope,
  sameBlockValue,
  type BlockValue,
  type CategoryDefinition,
  type CategoryId,
  type Scope,
} from '@components/ui/gambit/filters/filterRegistry';

export type ViewMode = 'SELECT_TARGET' | 'BUILD_CONDITION';

interface UseConditionStepProps {
  draft: DraftGambit;
  updateDraft: (updates: Partial<DraftGambit>) => void;
}

function toScope(targetId: string): Scope {
  return (['SELF', 'ALLY', 'ENEMY'].includes(targetId) ? targetId : 'ENEMY') as Scope;
}

/** Réouverture en édition : un DraftCondition = un bloc (catégorie + valeurs). */
function initSavedConditions(draft: DraftGambit): SavedCondition[] {
  const grouped = new Map<Scope, { blocks: ConditionBlock[]; blockOperator: 'AND' | 'OR' }>();
  for (const c of draft.conditions) {
    const existing = grouped.get(c.scopeKind);
    if (existing) {
      existing.blocks.push({ categoryId: c.filterTypeCategory, values: c.blockValues });
    } else {
      grouped.set(c.scopeKind, {
        blocks: [{ categoryId: c.filterTypeCategory, values: c.blockValues }],
        blockOperator: c.scopeOperator ?? 'AND',
      });
    }
  }
  return Array.from(grouped.entries()).map(([targetId, { blocks, blockOperator }]) => ({
    targetId,
    blocks,
    blockOperator,
  }));
}

function initConfiguredTargets(draft: DraftGambit): string[] {
  if (!draft.conditions) return [];
  return Array.from(new Set(draft.conditions.map((c) => c.scopeKind)));
}

export function useConditionStep({ draft, updateDraft }: UseConditionStepProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('SELECT_TARGET');
  const [activeTargetContext, setActiveTargetContext] = useState<string | null>(null);
  const [savedConditions, setSavedConditions] = useState<SavedCondition[]>(() =>
    initSavedConditions(draft),
  );
  const [configuredTargets, setConfiguredTargets] = useState<string[]>(() =>
    initConfiguredTargets(draft),
  );
  const [blocks, setBlocks] = useState<ConditionBlock[]>([]);
  const [blockOperator, setBlockOperator] = useState<'AND' | 'OR'>('AND');
  const [currentCat, setCurrentCat] = useState<CategoryId | null>(null);
  const [currentValues, setCurrentValues] = useState<BlockValue[]>([]);

  const updateDraftRef = useRef(updateDraft);
  useEffect(() => {
    updateDraftRef.current = updateDraft;
  });

  /* Aperçu vivant : blocs validés + bloc en cours. */
  const effectiveConditions = useMemo<SavedCondition[]>(() => {
    if (viewMode !== 'BUILD_CONDITION' || !activeTargetContext) return savedConditions;

    const pendingBlocks = [...blocks];
    if (currentCat && currentValues.length > 0) {
      pendingBlocks.push({ categoryId: currentCat, values: currentValues });
    }
    if (pendingBlocks.length === 0) return savedConditions;

    return [
      ...savedConditions.filter((c) => c.targetId !== activeTargetContext),
      { targetId: activeTargetContext, blocks: pendingBlocks, blockOperator },
    ];
  }, [viewMode, savedConditions, activeTargetContext, blocks, currentCat, currentValues, blockOperator]);

  /* Push vers le draft : UN DraftCondition par bloc (toutes ses valeurs). */
  useEffect(() => {
    const formatted: DraftCondition[] = effectiveConditions.flatMap((cond) =>
      cond.blocks.map((block) => ({
        id: `temp-${cond.targetId}-${block.categoryId}`,
        scopeKind: toScope(cond.targetId),
        filterTypeCategory: block.categoryId,
        blockValues: block.values,
        scopeOperator: cond.blockOperator,
      })),
    );
    updateDraftRef.current({ conditions: formatted });
  }, [effectiveConditions]);

  /* Catégories proposées selon le scope (déclaratif, via le registry). */
  const availableCategories = useMemo<readonly CategoryDefinition[]>(
    () => (activeTargetContext ? categoriesForScope(toScope(activeTargetContext)) : []),
    [activeTargetContext],
  );

  /* Options du picker courant. */
  const catOptions = useMemo(
    () => (currentCat ? (availableCategories.find((c) => c.id === currentCat)?.options ?? []) : []),
    [currentCat, availableCategories],
  );

  const bannerText = buildBannerText(activeTargetContext, blocks, blockOperator, currentCat, currentValues);

  /* ---------------- Handlers ---------------- */

  const handleSelectTarget = (id: string) => {
    const existing = savedConditions.find((c) => c.targetId === id);
    setBlocks(existing ? [...existing.blocks] : []);
    setBlockOperator(existing?.blockOperator ?? 'AND');
    setCurrentCat(null);
    setCurrentValues([]);
    setActiveTargetContext(id);
    setViewMode('BUILD_CONDITION');
  };

  const handleToggleBlockOperator = () => {
    setBlockOperator((prev) => (prev === 'AND' ? 'OR' : 'AND'));
  };

  /** Changer de catégorie valide le bloc en cours (évite la réinterprétation). */
  const handleSelectCat = (id: CategoryId) => {
    if (currentCat && currentCat !== id && currentValues.length > 0) {
      setBlocks((prev) => [...prev, { categoryId: currentCat, values: currentValues }]);
      setCurrentValues([]);
    }
    setCurrentCat(id);
  };

  const handleToggleValue = (v: BlockValue) => {
    setCurrentValues((prev) =>
      prev.some((x) => sameBlockValue(x, v))
        ? prev.filter((x) => !sameBlockValue(x, v))
        : [...prev, v],
    );
  };

  const handleConfirmBlock = () => {
    if (!currentCat || currentValues.length === 0) return;
    setBlocks((prev) => [...prev, { categoryId: currentCat, values: currentValues }]);
    setCurrentCat(null);
    setCurrentValues([]);
  };

  const handleRemoveBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveCurrentValue = (v: BlockValue) => {
    setCurrentValues((prev) => prev.filter((x) => !sameBlockValue(x, v)));
  };

  const handleRemoveTarget = (targetId: string) => {
    setSavedConditions((prev) => prev.filter((c) => c.targetId !== targetId));
    setConfiguredTargets((prev) => prev.filter((t) => t !== targetId));
  };

  const handleSaveConditionGroup = () => {
    const final = [...blocks];
    if (currentCat && currentValues.length > 0) {
      final.push({ categoryId: currentCat, values: currentValues });
    }

    if (activeTargetContext) {
      if (final.length > 0) {
        setSavedConditions((prev) => [
          ...prev.filter((c) => c.targetId !== activeTargetContext),
          { targetId: activeTargetContext, blocks: final, blockOperator },
        ]);
        setConfiguredTargets((prev) =>
          prev.includes(activeTargetContext) ? prev : [...prev, activeTargetContext],
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
    blockOperator,
    availableCategories,
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
    handleToggleBlockOperator,
    setCurrentCat: handleSelectCat,
    handleRemoveBlock,
    handleRemoveCurrentValue,
    handleRemoveTarget,
  };
}