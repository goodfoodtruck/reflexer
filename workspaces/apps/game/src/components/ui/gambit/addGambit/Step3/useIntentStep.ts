import { useState, useMemo } from 'react';
import type { DraftGambit } from '@components/ui/gambit/GambitTypes';
import { ACTION_CATEGORIES } from '@components/ui/gambit/actionCatalog';

interface UseIntentStepProps {
  draft: DraftGambit;
  updateDraft: (updates: Partial<DraftGambit>) => void;
}

export function useIntentStep({ draft, updateDraft }: UseIntentStepProps) {
  const [activeCategoryId, setActiveCategoryId] = useState(ACTION_CATEGORIES[0]?.id ?? '');

  const activeCategory = ACTION_CATEGORIES.find((c) => c.id === activeCategoryId);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const selectedActionDetails = useMemo(() => {
    for (const cat of ACTION_CATEGORIES) {
      const found = cat.items.find((i) => i.id === draft.intentValue);
      if (found) return { ...found, categoryName: cat.name };
    }
    return null;
  }, [draft.intentValue]);

  const handleSelectAction = (kind: "ACTION" | "MOVEMENT", id: string) => {
    updateDraft({ intentKind: kind, intentValue: id });
  };

  return {
    activeCategoryId,
    setActiveCategoryId,
    activeCategory,
    selectedActionDetails,
    selectedActionId: draft.intentValue,
    handleSelectAction
  };
}
