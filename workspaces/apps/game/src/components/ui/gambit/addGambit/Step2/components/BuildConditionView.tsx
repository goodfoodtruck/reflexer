import { motion } from 'framer-motion';
import type { ConditionBlock } from '../../../GambitTypes';
import {
  type BlockValueOption,
  type CategoryDefinition,
  type CategoryId,
  type FilterEntry,
  formatBlockValue,
} from '@components/ui/gambit/filters/filterRegistry';
import { ANIMATIONS } from '../constants/condition.constants';
import { Styles } from '../Condition.styles';
import { ConditionBreadcrumb } from './ConditionBreadcrumb';
import { ConditionBanner } from './ConditionBanner';
import { FocusTargetIcon } from './FocusTargetIcon';
import { ConditionStack } from './ConditionStack';
import { CriteriaListPane } from './CriteriaListPane';
import { StepFooter } from './StepFooter';
import { IconArrows } from '../../../../../../assets/icons/IconArrows';

interface BuildConditionViewProps {
  activeTargetContext: string | null;
  blocks: ConditionBlock[];
  blockOperators: ('AND' | 'OR')[];
  currentCat: CategoryId | null;
  currentBlockEntries: FilterEntry[];
  catOptions: readonly BlockValueOption[];
  availableCategories: readonly CategoryDefinition[];
  canSave: boolean;
  pendingValuesOperators: Record<string, 'AND' | 'OR'>;
  pendingGroupOperator: 'AND' | 'OR';
  onBack: () => void;
  onSelectCat: (id: CategoryId) => void;
  onToggleValue: (v: FilterEntry['value']) => void;
  onConfirmBlock: () => void;
  onRemoveBlock: (index: number) => void;
  onRemoveCurrentEntry: (entry: FilterEntry) => void;
  onToggleBlockOperator: (index: number) => void;
  onToggleBlockValuesOperator: (index: number) => void;
  onTogglePendingValuesOperator: (categoryId: CategoryId) => void;
  onTogglePendingGroupOperator: () => void;
  onSave: () => void;
}

export function BuildConditionView({
  activeTargetContext,
  blocks,
  blockOperators,
  currentCat,
  currentBlockEntries,
  catOptions,
  availableCategories,
  canSave,
  pendingValuesOperators,
  pendingGroupOperator,
  onBack,
  onSelectCat,
  onToggleValue,
  onConfirmBlock,
  onRemoveBlock,
  onRemoveCurrentEntry,
  onToggleBlockOperator,
  onToggleBlockValuesOperator,
  onTogglePendingValuesOperator,
  onTogglePendingGroupOperator,
  onSave,
}: BuildConditionViewProps) {
  const categoryItems = availableCategories.map((c) => ({ id: c.id, label: c.label }));

  const valueItems = currentCat
    ? catOptions.map((o) => ({ id: o.label, label: o.label, value: o.value }))
    : [];

  // Valeurs sélectionnées dans la catégorie active uniquement (panneau de droite)
  const selectedValueIds = currentCat
    ? currentBlockEntries
        .filter((e) => e.categoryId === currentCat)
        .map((e) => formatBlockValue(currentCat, e.value))
    : [];

  // Catégories qui ont des entrées dans le bloc courant (mais pas la catégorie active)
  const catsWithEntries = [...new Set(currentBlockEntries.map((e) => e.categoryId))].filter(
    (c) => c !== currentCat,
  );

  return (
    <motion.div {...ANIMATIONS.buildCondition} className={Styles.container}>
      <ConditionBreadcrumb
        backLabel="RAJOUTER UNE CONDITION"
        activeLabel="QUELS CRITÈRES ?"
        onBack={onBack}
      />

      <ConditionBanner
        activeTarget={activeTargetContext}
        blocks={blocks}
        blockOperators={blockOperators}
        pendingEntries={currentBlockEntries}
        pendingValuesOperators={pendingValuesOperators}
        pendingGroupOperator={pendingGroupOperator}
      />

      <div className={Styles.workArea}>
        <div className={Styles.workLayout}>
          <FocusTargetIcon targetId={activeTargetContext} />

          <IconArrows />

          <ConditionStack
            blocks={blocks}
            blockOperators={blockOperators}
            currentBlockEntries={currentBlockEntries}
            pendingValuesOperators={pendingValuesOperators}
            pendingGroupOperator={pendingGroupOperator}
            onConfirmBlock={onConfirmBlock}
            onRemoveBlock={onRemoveBlock}
            onRemoveCurrentEntry={onRemoveCurrentEntry}
            onToggleBlockOperator={onToggleBlockOperator}
            onToggleBlockValuesOperator={onToggleBlockValuesOperator}
            onTogglePendingValuesOperator={onTogglePendingValuesOperator}
            onTogglePendingGroupOperator={onTogglePendingGroupOperator}
          />

          <IconArrows />

          {/* Catégorie active → bleu (focusedIds), catégories avec entrées → ambre (selectedIds) */}
          <CriteriaListPane
            items={categoryItems}
            selectedIds={catsWithEntries}
            focusedIds={currentCat ? [currentCat] : []}
            onSelect={(id) => onSelectCat(id as CategoryId)}
          />

          {currentCat && (
            <>
              <IconArrows />
              <CriteriaListPane
                items={valueItems.map((v) => ({ id: v.id, label: v.label }))}
                selectedIds={selectedValueIds}
                showIcons={false}
                onSelect={(id) => {
                  const found = valueItems.find((v) => v.id === id);
                  if (found) onToggleValue(found.value);
                }}
              />
            </>
          )}
        </div>
      </div>

      <StepFooter onCancel={onBack} onSave={onSave} disabled={!canSave} />
    </motion.div>
  );
}
