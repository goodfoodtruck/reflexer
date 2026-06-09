import { motion } from 'framer-motion';
import { CRITERIA_DATA_CONDITION_STEP } from '../../../mockData';
import type { ConditionBlock } from '../../../GambitTypes';
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
  currentCat: string | null;
  currentValues: string[];
  catOptions: readonly string[];
  canSave: boolean;
  onBack: () => void;
  onSelectCat: (id: string) => void;
  onToggleValue: (v: string) => void;
  onConfirmBlock: () => void;
  onRemoveBlock: (index: number) => void;
  onRemoveCurrentValue: (v: string) => void;
  onSave: () => void;
}

export function BuildConditionView({
  activeTargetContext,
  bannerText,
  blocks,
  currentCat,
  currentValues,
  catOptions,
  canSave,
  onBack,
  onSelectCat,
  onToggleValue,
  onConfirmBlock,
  onRemoveBlock,
  onRemoveCurrentValue,
  onSave,
}: BuildConditionViewProps) {
  const categoryItems = CRITERIA_DATA_CONDITION_STEP.map((c) => ({ id: c.id, label: c.label }));

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
            currentCat={currentCat}
            currentValues={currentValues}
            onConfirmBlock={onConfirmBlock}
            onRemoveBlock={onRemoveBlock}
            onRemoveCurrentValue={onRemoveCurrentValue}
          />

          <IconArrows />

          <CriteriaListPane
            items={categoryItems}
            selectedIds={currentCat ? [currentCat] : []}
            onSelect={onSelectCat}
          />

          {currentCat && (
            <>
              <IconArrows />
              <CriteriaListPane
                items={catOptions as string[]}
                selectedIds={currentValues}
                onSelect={onToggleValue}
              />
            </>
          )}
        </div>
      </div>

      <StepFooter onCancel={onBack} onSave={onSave} disabled={!canSave} />
    </motion.div>
  );
}