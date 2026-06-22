import { motion } from 'framer-motion';
import {
  formatBlockValue,
  TARGET_FILTER_CATEGORIES,
  type BlockValue,
  type BlockValueOption,
  type CategoryId,
} from '@components/ui/gambit/filters/filterRegistry';
import { ConditionStack } from '../../Step2/components/ConditionStack';
import { CriteriaListPane } from '../../Step2/components/CriteriaListPane';
import type { FilterBlock } from '../useTargetStep';
import { formatBlockText } from '../useTargetStep';
import { Styles } from '../Target.styles';

interface StepFilterCriteriaProps {
  localKind: string | null;
  activeIcon: React.ReactNode;
  filterBlocks: FilterBlock[];
  currentFilterCat: CategoryId | null;
  currentFilterVals: BlockValue[];
  catOptions: readonly BlockValueOption[];
  onSelectCat: (id: CategoryId) => void;
  onToggleVal: (val: BlockValue) => void;
  onConfirmBlock: () => void;
  onRemoveBlock: (index: number) => void;
  onCancel: () => void;
  onNext: () => void;
}

export function StepFilterCriteria({
  localKind,
  activeIcon,
  filterBlocks,
  currentFilterCat,
  currentFilterVals,
  catOptions,
  onSelectCat,
  onToggleVal,
  onConfirmBlock,
  onRemoveBlock,
  onCancel,
  onNext,
}: StepFilterCriteriaProps) {
  const categoryItems = TARGET_FILTER_CATEGORIES.map((c) => ({ id: c.id, label: c.label }));

  const valueItems = catOptions.map((o) => ({ id: o.label, label: o.label, value: o.value }));

  const selectedValueIds = currentFilterCat
    ? currentFilterVals.map((v) => formatBlockValue(currentFilterCat, v))
    : [];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={Styles.container}>
      <div className={Styles.breadcrumb}>
        Cible &gt; <span className={Styles.activeBread}>Critères</span>
      </div>
      <div className={Styles.headerBar}>
        {localKind}:{' '}
        <span className="text-slate-300">
          {filterBlocks.map((b) => `(${formatBlockText(b.categoryId, b.values)})`).join(' ET ')}
        </span>
      </div>

      <div className={Styles.layoutCols}>
        <div className="flex flex-col items-center gap-4">
          <div className={Styles.smallIconBox}>{activeIcon}</div>
          <ConditionStack
            blocks={filterBlocks}
            currentCat={currentFilterCat}
            currentValues={currentFilterVals}
            onConfirmBlock={onConfirmBlock}
            onRemoveBlock={onRemoveBlock}
            onRemoveCurrentValue={onToggleVal}
          />
        </div>

        <CriteriaListPane
          items={categoryItems}
          selectedIds={currentFilterCat ? [currentFilterCat] : []}
          onSelect={(id) => onSelectCat(id as CategoryId)}
        />

        {currentFilterCat && (
          <CriteriaListPane
            items={valueItems}
            selectedIds={selectedValueIds}
            onSelect={(id) => {
              const opt = valueItems.find((v) => v.id === id);
              if (opt) onToggleVal(opt.value);
            }}
          />
        )}
      </div>

      <div className={Styles.footer}>
        <button onClick={onCancel} className={`${Styles.btnBase} ${Styles.btnSecondary}`}>Annuler</button>
        <button onClick={onNext} className={`${Styles.btnBase} ${Styles.btnPrimary}`}>Suivant</button>
      </div>
    </motion.div>
  );
}
