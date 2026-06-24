import { motion } from 'framer-motion';
import {
  formatBlockValue,
  TARGET_FILTER_CATEGORIES,
  type BlockValueOption,
  type CategoryId,
} from '@components/ui/gambit/filters/filterRegistry';
import { CriteriaListPane } from '../../Step2/components/CriteriaListPane';
import { TargetFilterStack } from './TargetFilterStack';
import type { FilterEntry, FilterOrGroup } from '../useTargetStep';
import { formatOrGroup } from '../useTargetStep';
import { Styles } from '../Target.styles';

interface StepFilterCriteriaProps {
  localKind: string | null;
  activeIcon: React.ReactNode;
  filterBlocks: FilterOrGroup[];
  currentFilterCat: CategoryId | null;
  currentBlockEntries: FilterEntry[];
  catOptions: readonly BlockValueOption[];
  onSelectCat: (id: CategoryId) => void;
  onToggleVal: (val: FilterEntry['value']) => void;
  onConfirmBlock: () => void;
  onRemoveBlock: (index: number) => void;
  onRemoveEntry: (entry: FilterEntry) => void;
  onCancel: () => void;
  onNext: () => void;
}

export function StepFilterCriteria({
  localKind,
  activeIcon,
  filterBlocks,
  currentFilterCat,
  currentBlockEntries,
  catOptions,
  onSelectCat,
  onToggleVal,
  onConfirmBlock,
  onRemoveBlock,
  onRemoveEntry,
  onCancel,
  onNext,
}: StepFilterCriteriaProps) {
  const categoryItems = TARGET_FILTER_CATEGORIES.map((c) => ({ id: c.id, label: c.label }));
  const valueItems = catOptions.map((o) => ({ id: o.label, label: o.label, value: o.value }));

  // Catégories qui ont au moins une entrée dans le bloc courant (indicateur visuel ambre)
  const catsWithEntries = [...new Set(currentBlockEntries.map((e) => e.categoryId))];

  // Valeurs sélectionnées dans la catégorie active (pour le panneau de droite)
  const selectedValueIds = currentFilterCat
    ? currentBlockEntries
        .filter((e) => e.categoryId === currentFilterCat)
        .map((e) => formatBlockValue(currentFilterCat, e.value))
    : [];

  const KIND_LABELS: Record<string, string> = { ENEMY: 'Ennemi', ALLY: 'Allié', SELF: 'Moi-même' };
  const kindLabel = KIND_LABELS[localKind ?? ''] ?? localKind;

  const headerText = [
    ...filterBlocks.map((g) => `(${formatOrGroup(g)})`),
    ...(currentBlockEntries.length > 0 ? [`(${formatOrGroup(currentBlockEntries)})`] : []),
  ].join(' ET ');

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={Styles.container}>
      <div className={Styles.breadcrumb}>
        Cible &gt; <span className={Styles.activeBread}>Critères</span>
      </div>
      <div className={Styles.headerBar}>
        {kindLabel}:{' '}
        <span className="text-slate-300">{headerText || '(Aucun filtre sélectionné)'}</span>
      </div>

      <div className={Styles.layoutCols}>
        <div className="flex flex-col items-center gap-4">
          <div className={Styles.smallIconBox}>{activeIcon}</div>
          <TargetFilterStack
            orGroups={filterBlocks}
            currentBlockEntries={currentBlockEntries}
            currentFilterCat={currentFilterCat}
            onConfirmBlock={onConfirmBlock}
            onRemoveBlock={onRemoveBlock}
            onRemoveEntry={onRemoveEntry}
          />
        </div>

        {/* Panneau catégories : focusedIds = catégorie active (bleu), selectedIds = cat avec entrées (ambre) */}
        <CriteriaListPane
          items={categoryItems}
          selectedIds={catsWithEntries.filter((c) => c !== currentFilterCat)}
          focusedIds={currentFilterCat ? [currentFilterCat] : []}
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
