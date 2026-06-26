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
  pendingValuesOperators: Record<string, 'AND' | 'OR'>;
  pendingGroupOperator: 'AND' | 'OR';
  onSelectCat: (id: CategoryId) => void;
  onToggleVal: (val: FilterEntry['value']) => void;
  onConfirmBlock: () => void;
  onRemoveBlock: (index: number) => void;
  onRemoveEntry: (entry: FilterEntry) => void;
  onTogglePendingValuesOperator: (categoryId: CategoryId) => void;
  onTogglePendingGroupOperator: () => void;
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
  pendingValuesOperators,
  pendingGroupOperator,
  onSelectCat,
  onToggleVal,
  onConfirmBlock,
  onRemoveBlock,
  onRemoveEntry,
  onTogglePendingValuesOperator,
  onTogglePendingGroupOperator,
  onCancel,
  onNext,
}: StepFilterCriteriaProps) {
  const categoryItems = TARGET_FILTER_CATEGORIES.map((c) => ({ id: c.id, label: c.label }));
  const valueItems = catOptions.map((o) => ({ id: o.label, label: o.label, value: o.value }));

  const catsWithEntries = [...new Set(currentBlockEntries.map((e) => e.categoryId))];

  const selectedValueIds = currentFilterCat
    ? currentBlockEntries
        .filter((e) => e.categoryId === currentFilterCat)
        .map((e) => formatBlockValue(currentFilterCat, e.value))
    : [];

  const KIND_LABELS: Record<string, string> = { ENEMY: 'Ennemi', ALLY: 'Allié', SELF: 'Moi-même' };
  const kindLabel = KIND_LABELS[localKind ?? ''] ?? localKind;

  // Construire le texte du banner avec parenthèses pour le bloc pending multi-catégories
  const confirmedParts = filterBlocks.map((g) => `(${formatOrGroup(g)})`);
  let pendingText = '';
  if (currentBlockEntries.length > 0) {
    const byCat = new Map<CategoryId, FilterEntry[]>();
    for (const e of currentBlockEntries) {
      const arr = byCat.get(e.categoryId) ?? [];
      arr.push(e);
      byCat.set(e.categoryId, arr);
    }
    const catParts = Array.from(byCat.entries()).map(([, entries]) =>
      entries.map((e) => formatBlockValue(e.categoryId, e.value)).join(' OU '),
    );
    const sep = pendingGroupOperator === 'AND' ? ' ET ' : ' OU ';
    pendingText = catParts.length > 1 ? `(${catParts.join(sep)})` : `(${catParts[0] ?? ''})`;
  }
  const allParts = [...confirmedParts, ...(pendingText ? [pendingText] : [])];
  const headerText = allParts.join(' ET ');

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
            pendingValuesOperators={pendingValuesOperators}
            pendingGroupOperator={pendingGroupOperator}
            onConfirmBlock={onConfirmBlock}
            onRemoveBlock={onRemoveBlock}
            onRemoveEntry={onRemoveEntry}
            onTogglePendingValuesOperator={onTogglePendingValuesOperator}
            onTogglePendingGroupOperator={onTogglePendingGroupOperator}
          />
        </div>

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
            showIcons={false}
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
