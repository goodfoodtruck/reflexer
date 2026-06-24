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
  bannerText: string;
  blocks: ConditionBlock[];
  blockOperators: ('AND' | 'OR')[];
  currentCat: CategoryId | null;
  currentBlockEntries: FilterEntry[];
  catOptions: readonly BlockValueOption[];
  availableCategories: readonly CategoryDefinition[];
  canSave: boolean;
  pendingValuesOperators: Record<string, 'AND' | 'OR'>;
  onBack: () => void;
  onSelectCat: (id: CategoryId) => void;
  onToggleValue: (v: FilterEntry['value']) => void;
  onConfirmBlock: () => void;
  onRemoveBlock: (index: number) => void;
  onRemoveCurrentEntry: (entry: FilterEntry) => void;
  onToggleBlockOperator: (index: number) => void;
  onToggleBlockValuesOperator: (index: number) => void;
  onTogglePendingValuesOperator: (categoryId: CategoryId) => void;
  onSave: () => void;
}

export function BuildConditionView({
  activeTargetContext,
  bannerText,
  blocks,
  blockOperators,
  currentCat,
  currentBlockEntries,
  catOptions,
  availableCategories,
  canSave,
  pendingValuesOperators,
  onBack,
  onSelectCat,
  onToggleValue,
  onConfirmBlock,
  onRemoveBlock,
  onRemoveCurrentEntry,
  onToggleBlockOperator,
  onToggleBlockValuesOperator,
  onTogglePendingValuesOperator,
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

      <ConditionBanner text={bannerText} />

      <div className={Styles.workArea}>
        <div className={Styles.workLayout}>
          <FocusTargetIcon targetId={activeTargetContext} />

          <IconArrows />

          <ConditionStack
            blocks={blocks}
            blockOperators={blockOperators}
            currentCat={currentCat}
            currentBlockEntries={currentBlockEntries}
            onConfirmBlock={onConfirmBlock}
            onRemoveBlock={onRemoveBlock}
            onRemoveCurrentEntry={onRemoveCurrentEntry}
            onToggleBlockOperator={onToggleBlockOperator}
            onToggleBlockValuesOperator={onToggleBlockValuesOperator}
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
              <div className="flex flex-col items-center gap-2">
                {selectedValueIds.length > 1 && (
                  <button
                    onClick={() => onTogglePendingValuesOperator(currentCat)}
                    className={`font-black uppercase text-[10px] px-3 py-1 rounded border transition-colors ${
                      (pendingValuesOperators[currentCat] ?? 'OR') === 'AND'
                        ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 hover:bg-sky-500/30'
                        : 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                    }`}
                    title="Basculer l'opérateur entre les valeurs sélectionnées"
                  >
                    {(pendingValuesOperators[currentCat] ?? 'OR') === 'AND' ? 'ET' : 'OU'}
                  </button>
                )}
                <CriteriaListPane
                  items={valueItems.map((v) => ({ id: v.id, label: v.label }))}
                  selectedIds={selectedValueIds}
                  onSelect={(id) => {
                    const found = valueItems.find((v) => v.id === id);
                    if (found) onToggleValue(found.value);
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <StepFooter onCancel={onBack} onSave={onSave} disabled={!canSave} />
    </motion.div>
  );
}
