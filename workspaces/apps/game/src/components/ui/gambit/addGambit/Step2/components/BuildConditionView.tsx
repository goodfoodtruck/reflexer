import { motion } from 'framer-motion';
import type { ConditionBlock } from '../../../GambitTypes';
import {
  type BlockValue,
  type BlockValueOption,
  type CategoryDefinition,
  type CategoryId,
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
  bannerText: string;
  blocks: ConditionBlock[];
  blockOperator: 'AND' | 'OR';
  currentCat: CategoryId | null;
  currentValues: BlockValue[];
  catOptions: readonly BlockValueOption[];
  availableCategories: readonly CategoryDefinition[];
  canSave: boolean;
  onBack: () => void;
  onSelectCat: (id: CategoryId) => void;
  onToggleValue: (v: BlockValue) => void;
  onConfirmBlock: () => void;
  onRemoveBlock: (index: number) => void;
  onRemoveCurrentValue: (v: BlockValue) => void;
  onToggleBlockOperator: () => void;
  onSave: () => void;
}

export function BuildConditionView({
  activeTargetContext,
  bannerText,
  blocks,
  blockOperator,
  currentCat,
  currentValues,
  catOptions,
  availableCategories,
  canSave,
  onBack,
  onSelectCat,
  onToggleValue,
  onConfirmBlock,
  onRemoveBlock,
  onRemoveCurrentValue,
  onToggleBlockOperator,
  onSave,
}: BuildConditionViewProps) {
  const categoryItems = availableCategories.map((c) => ({ id: c.id, label: c.label }));

  // Pour CriteriaListPane : chaque option a un id stable (libellé) et un label.
  // L'égalité sur BlockValue passe par le libellé déjà calculé dans le registry.
  const valueItems = currentCat
    ? catOptions.map((o) => ({ id: o.label, label: o.label, value: o.value }))
    : [];

  const selectedValueIds = currentValues.map((v) =>
    currentCat ? formatBlockValue(currentCat, v) : ''
  );

  return (
    <motion.div {...ANIMATIONS.buildCondition} className={Styles.container}>
      <ConditionBreadcrumb
        backLabel="RAJOUTER UNE CONDITION"
        activeLabel="QUELS CRITÈRES ?"
        onBack={onBack}
      />

      <ConditionBanner text={bannerText} />

      <div className={Styles.workArea}>
        <div className={Styles.workLayout}>
          <FocusTargetIcon targetId={activeTargetContext} />

          <IconArrows />

          <ConditionStack
            blocks={blocks}
            blockOperator={blockOperator}
            currentCat={currentCat}
            currentValues={currentValues}
            onConfirmBlock={onConfirmBlock}
            onRemoveBlock={onRemoveBlock}
            onRemoveCurrentValue={onRemoveCurrentValue}
            onToggleBlockOperator={onToggleBlockOperator}
          />

          <IconArrows />

          <CriteriaListPane
            items={categoryItems}
            selectedIds={currentCat ? [currentCat] : []}
            onSelect={(id) => onSelectCat(id as CategoryId)}
          />

          {currentCat && (
            <>
              <IconArrows />
              <CriteriaListPane
                items={valueItems.map((v) => ({ id: v.id, label: v.label }))}
                selectedIds={selectedValueIds}
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