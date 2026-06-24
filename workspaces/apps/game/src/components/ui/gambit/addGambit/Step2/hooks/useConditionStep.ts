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
  type CategoryDefinition,
  type CategoryId,
  type FilterEntry,
  type Scope,
} from '@components/ui/gambit/filters/filterRegistry';

export type ViewMode = 'SELECT_TARGET' | 'BUILD_CONDITION';
export type { FilterEntry };

interface UseConditionStepProps {
  draft: DraftGambit;
  updateDraft: (updates: Partial<DraftGambit>) => void;
}

function toScope(targetId: string): Scope {
  return (['SELF', 'ALLY', 'ENEMY'].includes(targetId) ? targetId : 'ENEMY') as Scope;
}

/** Réouverture en édition : un DraftCondition = un bloc (catégorie + valeurs). */
function initSavedConditions(draft: DraftGambit): SavedCondition[] {
  const grouped = new Map<Scope, { blocks: ConditionBlock[]; blockOperators: ('AND' | 'OR')[] }>();
  for (const c of draft.conditions) {
    const existing = grouped.get(c.scopeKind);
    if (existing) {
      existing.blocks.push({ categoryId: c.filterTypeCategory, values: c.blockValues, valuesOperator: c.valuesOperator ?? 'OR' });
      existing.blockOperators.push(c.scopeOperator ?? 'AND');
    } else {
      grouped.set(c.scopeKind, {
        blocks: [{ categoryId: c.filterTypeCategory, values: c.blockValues, valuesOperator: c.valuesOperator ?? 'OR' }],
        blockOperators: [c.scopeOperator ?? 'AND'],
      });
    }
  }
  return Array.from(grouped.entries()).map(([targetId, { blocks, blockOperators }]) => ({
    targetId,
    blocks,
    blockOperators,
  }));
}

function initConfiguredTargets(draft: DraftGambit): string[] {
  if (!draft.conditions) return [];
  return Array.from(new Set(draft.conditions.map((c) => c.scopeKind)));
}

function buildBlocksFromEntries(entries: FilterEntry[], valuesOperators: Record<string, 'AND' | 'OR'> = {}): ConditionBlock[] {
  const byCat = new Map<CategoryId, FilterEntry['value'][]>();
  for (const e of entries) {
    const vals = byCat.get(e.categoryId) ?? [];
    vals.push(e.value);
    byCat.set(e.categoryId, vals);
  }
  return Array.from(byCat.entries()).map(([categoryId, values]) => ({
    categoryId,
    values,
    valuesOperator: valuesOperators[categoryId] ?? 'OR',
  }));
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
  /**
   * blockOperators[i] = opérateur APRÈS block[i], reliant block[i] à block[i+1].
   * Length === blocks.length : le dernier entrée est l'opérateur par défaut pour le prochain groupe.
   */
  const [blockOperators, setBlockOperators] = useState<('AND' | 'OR')[]>([]);
  const [currentCat, setCurrentCat] = useState<CategoryId | null>(null);
  /** Entrées du bloc OR en cours (multi-catégories, pas encore confirmées via "+"). */
  const [currentBlockEntries, setCurrentBlockEntries] = useState<FilterEntry[]>([]);
  /** Opérateur intra-valeurs par catégorie pour le bloc en cours (OU par défaut). */
  const [pendingValuesOperators, setPendingValuesOperators] = useState<Record<string, 'AND' | 'OR'>>({});

  const updateDraftRef = useRef(updateDraft);
  useEffect(() => {
    updateDraftRef.current = updateDraft;
  });

  /* Aperçu vivant : blocs validés + bloc en cours. */
  const effectiveConditions = useMemo<SavedCondition[]>(() => {
    if (viewMode !== 'BUILD_CONDITION' || !activeTargetContext) return savedConditions;

    const pendingBlocks = [...blocks];
    const pendingOps = [...blockOperators];

    if (currentBlockEntries.length > 0) {
      const newBlocks = buildBlocksFromEntries(currentBlockEntries, pendingValuesOperators);
      const N = newBlocks.length;
      pendingBlocks.push(...newBlocks);
      if (N > 1) pendingOps.push(...new Array(N - 1).fill('OR' as const));
      pendingOps.push('AND' as const);
    }

    if (pendingBlocks.length === 0) return savedConditions;

    return [
      ...savedConditions.filter((c) => c.targetId !== activeTargetContext),
      { targetId: activeTargetContext, blocks: pendingBlocks, blockOperators: pendingOps },
    ];
  }, [viewMode, savedConditions, activeTargetContext, blocks, currentBlockEntries, blockOperators, pendingValuesOperators]);

  /* Push vers le draft : UN DraftCondition par bloc (toutes ses valeurs). */
  useEffect(() => {
    const formatted: DraftCondition[] = effectiveConditions.flatMap((cond) =>
      cond.blocks.map((block, i) => ({
        id: `temp-${cond.targetId}-${block.categoryId}`,
        scopeKind: toScope(cond.targetId),
        filterTypeCategory: block.categoryId,
        blockValues: block.values,
        scopeOperator: cond.blockOperators[i] ?? 'AND',
        valuesOperator: block.valuesOperator ?? 'OR',
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

  const bannerText = buildBannerText(activeTargetContext, blocks, blockOperators, currentBlockEntries, pendingValuesOperators);

  /* ---------------- Handlers ---------------- */

  const handleSelectTarget = (id: string) => {
    const existing = savedConditions.find((c) => c.targetId === id);
    setBlocks(existing ? [...existing.blocks] : []);
    setBlockOperators(existing ? [...existing.blockOperators] : []);
    setCurrentCat(null);
    setCurrentBlockEntries([]);
    setPendingValuesOperators({});
    setActiveTargetContext(id);
    setViewMode('BUILD_CONDITION');
  };

  /** Toggle l'opérateur après le bloc à l'index donné (indépendant par séparateur). */
  const handleToggleBlockOperator = (index: number) => {
    setBlockOperators((prev) =>
      prev.map((op, i) => (i === index ? (op === 'AND' ? 'OR' : 'AND') : op)),
    );
  };

  /** Toggle l'opérateur entre les valeurs d'un bloc confirmé. */
  const handleToggleBlockValuesOperator = (blockIndex: number) => {
    setBlocks((prev) =>
      prev.map((b, i) =>
        i === blockIndex
          ? { ...b, valuesOperator: (b.valuesOperator ?? 'OR') === 'AND' ? 'OR' : 'AND' }
          : b,
      ),
    );
  };

  /** Toggle l'opérateur entre les valeurs du bloc en cours pour une catégorie donnée. */
  const handleTogglePendingValuesOperator = (categoryId: CategoryId) => {
    setPendingValuesOperators((prev) => ({
      ...prev,
      [categoryId]: (prev[categoryId] ?? 'OR') === 'AND' ? 'OR' : 'AND',
    }));
  };

  const handleSelectCat = (id: CategoryId) => {
    setCurrentCat(id);
  };

  const handleToggleValue = (v: FilterEntry['value']) => {
    if (!currentCat) return;
    const cat = currentCat;
    setCurrentBlockEntries((prev) => {
      const idx = prev.findIndex(
        (e) => e.categoryId === cat && sameBlockValue(e.value, v),
      );
      if (idx >= 0) return prev.filter((_, i) => i !== idx);
      return [...prev, { categoryId: cat, value: v }];
    });
  };

  /**
   * "+" : confirme le bloc en cours.
   * Les N blocs générés reçoivent N opérateurs : (N-1) OU intra-groupe + 1 ET par défaut.
   * L'opérateur AVANT le premier nouveau bloc (=blockOperators[blocks.length-1]) est déjà
   * présent et indépendamment togglable par l'utilisateur avant de cliquer "+".
   */
  const handleConfirmBlock = () => {
    if (currentBlockEntries.length === 0) return;

    const newBlocks = buildBlocksFromEntries(currentBlockEntries, pendingValuesOperators);
    const N = newBlocks.length;
    const newOps: ('AND' | 'OR')[] = [
      ...new Array(Math.max(0, N - 1)).fill('OR' as const),
      'AND' as const,
    ];

    setBlocks((prev) => [...prev, ...newBlocks]);
    setBlockOperators((prev) => [...prev, ...newOps]);
    const confirmedCats = new Set(currentBlockEntries.map((e) => e.categoryId));
    setPendingValuesOperators((prev) => {
      const next = { ...prev };
      for (const cat of confirmedCats) delete next[cat];
      return next;
    });
    setCurrentBlockEntries([]);
  };

  const handleRemoveBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
    setBlockOperators((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveCurrentEntry = (entry: FilterEntry) => {
    setCurrentBlockEntries((prev) =>
      prev.filter(
        (e) => !(e.categoryId === entry.categoryId && sameBlockValue(e.value, entry.value)),
      ),
    );
  };

  const handleRemoveTarget = (targetId: string) => {
    setSavedConditions((prev) => prev.filter((c) => c.targetId !== targetId));
    setConfiguredTargets((prev) => prev.filter((t) => t !== targetId));
  };

  const handleSaveConditionGroup = () => {
    const final = [...blocks];
    const finalOps = [...blockOperators];

    if (currentBlockEntries.length > 0) {
      const newBlocks = buildBlocksFromEntries(currentBlockEntries, pendingValuesOperators);
      const N = newBlocks.length;
      final.push(...newBlocks);
      if (N > 1) finalOps.push(...new Array(N - 1).fill('OR' as const));
      finalOps.push('AND' as const);
    }

    if (activeTargetContext) {
      if (final.length > 0) {
        setSavedConditions((prev) => [
          ...prev.filter((c) => c.targetId !== activeTargetContext),
          { targetId: activeTargetContext, blocks: final, blockOperators: finalOps },
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
    setBlockOperators([]);
    setCurrentCat(null);
    setCurrentBlockEntries([]);
    setPendingValuesOperators({});
    setViewMode('SELECT_TARGET');
  };

  const handleCancelBuild = () => {
    setPendingValuesOperators({});
    setViewMode('SELECT_TARGET');
  };

  const canSave = blocks.length > 0 || currentBlockEntries.length > 0;

  return {
    viewMode,
    activeTargetContext,
    configuredTargets,
    blocks,
    blockOperators,
    availableCategories,
    currentCat,
    currentBlockEntries,
    catOptions,
    bannerText,
    canSave,
    pendingValuesOperators,
    handleSelectTarget,
    handleToggleValue,
    handleConfirmBlock,
    handleSaveConditionGroup,
    handleCancelBuild,
    handleToggleBlockOperator,
    handleToggleBlockValuesOperator,
    handleTogglePendingValuesOperator,
    setCurrentCat: handleSelectCat,
    handleRemoveBlock,
    handleRemoveCurrentEntry,
    handleRemoveTarget,
  };
}
