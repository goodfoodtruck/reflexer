import { motion } from 'framer-motion';
import { SORT_CATEGORIES } from '../../../mockData';
import { Styles } from '../Target.styles';

interface StepSortPriorityProps {
  localKind: string | null;
  activeIcon: React.ReactNode;
  sortVal: string | null;
  sortCat: string | null;
  sortOptions: readonly string[];
  onSelectSortCat: (id: string) => void;
  onSelectSortVal: (val: string) => void;
  onBack: () => void;
  onSave: () => void;
}

export function StepSortPriority({
  localKind,
  activeIcon,
  sortVal,
  sortCat,
  sortOptions,
  onSelectSortCat,
  onSelectSortVal,
  onBack,
  onSave
}: StepSortPriorityProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={Styles.container}
    >
      <div className={Styles.breadcrumb}>
        Critères &gt; <span className={Styles.activeBread}>Priorité</span>
      </div>
      <div className={Styles.headerBar}>
        {localKind}: <span className="text-slate-300">{sortVal || 'Sélectionnez un tri'}</span>
      </div>

      <div className={Styles.layoutCols}>
        <div className="flex flex-col items-center gap-2 min-w-[200px]">
          <div className={Styles.smallIconBox}>{activeIcon}</div>
        </div>

        <div className={Styles.colList}>
          {SORT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectSortCat(cat.id)}
              className={`${Styles.listItem} ${sortCat === cat.id ? Styles.listItemActive : Styles.listItemIdle}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className={Styles.colList}>
          {sortOptions.map((val) => (
            <button
              key={val}
              onClick={() => onSelectSortVal(val)}
              className={`${Styles.listItem} ${sortVal === val ? Styles.listItemActive : Styles.listItemIdle}`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      <div className={Styles.footer}>
        <button onClick={onBack} className={`${Styles.btnBase} ${Styles.btnSecondary}`}>
          Retour
        </button>
        <button
          onClick={onSave}
          disabled={!sortVal}
          className={`${Styles.btnBase} ${Styles.btnPrimary}`}
        >
          Enregistrer
        </button>
      </div>
    </motion.div>
  );
}
