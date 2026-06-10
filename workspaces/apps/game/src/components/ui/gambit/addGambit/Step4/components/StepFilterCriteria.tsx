import { motion } from 'framer-motion';
import { IconPlus } from '../../../../../../assets/icons/IconPlus';
import { FILTER_CATEGORIES } from '../../../gambitEditorOptions';
import type { FilterBlock } from '../useTargetStep';
import { formatBlockText } from '../useTargetStep';
import { Styles } from '../Target.styles';

interface StepFilterCriteriaProps {
  localKind: string | null;
  activeIcon: React.ReactNode;
  filterBlocks: FilterBlock[];
  currentFilterCat: string | null;
  currentFilterVals: string[];
  catOptions: readonly string[];
  onSelectCat: (id: string) => void;
  onToggleVal: (val: string) => void;
  onConfirmBlock: () => void;
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
  onCancel,
  onNext
}: StepFilterCriteriaProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={Styles.container}
    >
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
        <div className="flex flex-col items-center gap-2 min-w-[200px]">
          <div className={Styles.smallIconBox}>{activeIcon}</div>
          <div className="flex flex-col gap-2 w-full">
            {filterBlocks.map((b, i) => (
              <div key={i} className={`${Styles.blockContainer} ${Styles.blockSolid}`}>
                {formatBlockText(b.categoryId, b.values)}
              </div>
            ))}
            {currentFilterVals.length > 0 ? (
              <>
                <div className={`${Styles.blockContainer} ${Styles.blockSolid}`}>
                  {formatBlockText(currentFilterCat!, currentFilterVals)}
                </div>
                <button onClick={onConfirmBlock} className={Styles.btnAdd}>
                  <IconPlus />
                </button>
              </>
            ) : (
              <div className={`${Styles.blockContainer} ${Styles.blockDashed}`}>
                Filtre Optionnel
              </div>
            )}
          </div>
        </div>

        <div className={Styles.colList}>
          {FILTER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCat(cat.id)}
              className={`${Styles.listItem} ${currentFilterCat === cat.id ? Styles.listItemActive : Styles.listItemIdle}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className={Styles.colList}>
          {catOptions.map((val) => (
            <button
              key={val}
              onClick={() => onToggleVal(val)}
              className={`${Styles.listItem} ${currentFilterVals.includes(val) ? Styles.listItemActive : Styles.listItemIdle}`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      <div className={Styles.footer}>
        <button onClick={onCancel} className={`${Styles.btnBase} ${Styles.btnSecondary}`}>
          Annuler
        </button>
        <button onClick={onNext} className={`${Styles.btnBase} ${Styles.btnPrimary}`}>
          Suivant
        </button>
      </div>
    </motion.div>
  );
}
