import { useState, useMemo } from 'react';
import type { DraftCondition, DraftGambit, Scope } from '../../../GambitTypes';
import {
  categoriesForScope,
  type CategoryDefinition,
  type CategoryId,
  type BlockValue,
} from '@components/ui/gambit/filters/filterRegistry';

type PickerBatch = { categoryId: CategoryId; values: BlockValue[]; valuesOp: 'AND' | 'OR' };

interface UseConditionStepProps {
  draft: DraftGambit;
  updateDraft: (updates: Partial<DraftGambit>) => void;
}

export function useConditionStep({ draft, updateDraft }: UseConditionStepProps) {
  const [activeScope, setActiveScope] = useState<Scope>('SELF');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerCat, setPickerCat] = useState<CategoryId | null>(null);

  const availableCategories = useMemo<readonly CategoryDefinition[]>(
    () => categoriesForScope(activeScope),
    [activeScope],
  );

  const conditionsForScope = (scope: Scope): DraftCondition[] =>
    draft.conditions.filter((c) => c.scopeKind === scope);

  const conditionCounts: Record<Scope, number> = {
    SELF:  conditionsForScope('SELF').length,
    ALLY:  conditionsForScope('ALLY').length,
    ENEMY: conditionsForScope('ENEMY').length,
  };

  const handleAddConditions = (scope: Scope, batch: PickerBatch[]) => {
    const toAdd: DraftCondition[] = batch
      .filter((b) => b.values.length > 0)
      .map((b, i) => ({
        id: `${scope}-${b.categoryId}-${Date.now()}-${i}`,
        scopeKind: scope,
        filterTypeCategory: b.categoryId,
        blockValues: b.values,
        valuesOperator: b.valuesOp,
      }));
    if (toAdd.length === 0) return;
    updateDraft({ conditions: [...draft.conditions, ...toAdd] });
    setPickerOpen(false);
    setPickerCat(null);
  };

  const handleRemoveCondition = (id: string) => {
    updateDraft({ conditions: draft.conditions.filter((c) => c.id !== id) });
  };

  const handleToggleScopeOp = (id: string) => {
    updateDraft({
      conditions: draft.conditions.map((c) =>
        c.id === id
          ? { ...c, scopeOperator: (c.scopeOperator ?? 'AND') === 'AND' ? 'OR' : 'AND' }
          : c,
      ),
    });
  };

  const openPicker = () => {
    setPickerOpen(true);
    setPickerCat(null);
  };

  const closePicker = () => {
    setPickerOpen(false);
    setPickerCat(null);
  };

  return {
    activeScope,
    setActiveScope,
    pickerOpen,
    pickerCat,
    setPickerCat,
    availableCategories,
    conditionsForScope,
    conditionCounts,
    handleAddConditions,
    handleRemoveCondition,
    handleToggleScopeOp,
    openPicker,
    closePicker,
  };
}
