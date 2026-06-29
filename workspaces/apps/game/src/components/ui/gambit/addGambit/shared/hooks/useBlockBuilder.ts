import { useState, useMemo } from 'react';
import {
  sameBlockValue,
  type CategoryDefinition,
  type CategoryId,
  type FilterEntry,
} from '@components/ui/gambit/filters/filterRegistry';

interface UseBlockBuilderOptions {
  availableCategories: readonly CategoryDefinition[];
  onConfirm: (
    entries: FilterEntry[],
    pendingGroupOperator: 'AND' | 'OR',
    pendingValuesOperators: Record<string, 'AND' | 'OR'>,
  ) => void;
}

/**
 * Gère l'état du bloc en cours de construction (catégorie active, entrées, opérateurs).
 * Partagé entre Step2 (condition) et Step4 (filtres cible) pour éviter la duplication.
 */
export function useBlockBuilder({ availableCategories, onConfirm }: UseBlockBuilderOptions) {
  const [currentCat, setCurrentCat] = useState<CategoryId | null>(null);
  const [currentBlockEntries, setCurrentBlockEntries] = useState<FilterEntry[]>([]);
  const [pendingValuesOperators, setPendingValuesOperators] = useState<Record<string, 'AND' | 'OR'>>({});
  const [pendingGroupOperator, setPendingGroupOperator] = useState<'AND' | 'OR'>('OR');

  const catOptions = useMemo(
    () => (currentCat ? (availableCategories.find((c) => c.id === currentCat)?.options ?? []) : []),
    [currentCat, availableCategories],
  );

  const handleSelectCat = (id: CategoryId) => {
    setCurrentCat(id);
  };

  const handleToggleValue = (v: FilterEntry['value']) => {
    if (!currentCat) return;
    const cat = currentCat;
    setCurrentBlockEntries((prev) => {
      const idx = prev.findIndex((e) => e.categoryId === cat && sameBlockValue(e.value, v));
      if (idx >= 0) return prev.filter((_, i) => i !== idx);
      return [...prev, { categoryId: cat, value: v }];
    });
  };

  const handleRemoveCurrentEntry = (entry: FilterEntry) => {
    setCurrentBlockEntries((prev) =>
      prev.filter(
        (e) => !(e.categoryId === entry.categoryId && sameBlockValue(e.value, entry.value)),
      ),
    );
  };

  const handleTogglePendingValuesOperator = (categoryId: CategoryId) => {
    setPendingValuesOperators((prev) => ({
      ...prev,
      [categoryId]: (prev[categoryId] ?? 'OR') === 'AND' ? 'OR' : 'AND',
    }));
  };

  const handleTogglePendingGroupOperator = () => {
    setPendingGroupOperator((prev) => (prev === 'AND' ? 'OR' : 'AND'));
  };

  const handleConfirmBlock = () => {
    if (currentBlockEntries.length === 0) return;
    onConfirm(currentBlockEntries, pendingGroupOperator, pendingValuesOperators);
    resetBlockBuilder();
  };

  const resetBlockBuilder = () => {
    setCurrentBlockEntries([]);
    setPendingValuesOperators({});
    setPendingGroupOperator('OR');
  };

  return {
    currentCat,
    currentBlockEntries,
    catOptions,
    pendingValuesOperators,
    pendingGroupOperator,
    handleSelectCat,
    handleToggleValue,
    handleRemoveCurrentEntry,
    handleTogglePendingValuesOperator,
    handleTogglePendingGroupOperator,
    handleConfirmBlock,
    resetBlockBuilder,
  };
}
