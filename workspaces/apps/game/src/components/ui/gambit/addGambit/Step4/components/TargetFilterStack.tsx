import { IconPlus } from '../../../../../../assets/icons/IconPlus';
import { IconTrash } from '../../../../../../assets/icons/IconTrash';
import { formatBlockValue, type BlockValue, type CategoryId } from '@components/ui/gambit/filters/filterRegistry';
import type { FilterEntry, FilterOrGroup } from '../useTargetStep';
import { formatOrGroup } from '../useTargetStep';
import { Styles_conditionStack } from '../../Step2/Condition.styles';

interface TargetFilterStackProps {
  /** Groupes OR confirmés (reliés par ET). */
  orGroups: FilterOrGroup[];
  /** Entrées du groupe OR en cours de construction (multi-catégories). */
  currentBlockEntries: FilterEntry[];
  /** Catégorie active dans le panneau de droite (pour afficher les valeurs de la cat courante). */
  currentFilterCat: CategoryId | null;
  onConfirmBlock: () => void;
  onRemoveBlock: (index: number) => void;
  onRemoveEntry: (entry: FilterEntry) => void;
}

export function TargetFilterStack({
  orGroups,
  currentBlockEntries,
  currentFilterCat,
  onConfirmBlock,
  onRemoveBlock,
  onRemoveEntry,
}: TargetFilterStackProps) {
  return (
    <div className={Styles_conditionStack.stackWrapper}>
      {orGroups.map((group, i) => (
        <div key={i} className="flex flex-col items-center gap-3">
          <div className={`${Styles_conditionStack.stackItem} ${Styles_conditionStack.stackItemWithDelete}`}>
            <span>{formatOrGroup(group)}</span>
            <button
              onClick={() => onRemoveBlock(i)}
              className={Styles_conditionStack.stackDeleteBtn}
              title="Supprimer ce bloc"
            >
              <IconTrash />
            </button>
          </div>
          <span className={Styles_conditionStack.stackAnd}>ET</span>
        </div>
      ))}

      {currentBlockEntries.length > 0 ? (
        <div className="flex flex-col items-center gap-3 w-full">
          <div
            className={`${Styles_conditionStack.stackItem} ${Styles_conditionStack.stackItemActive} ${Styles_conditionStack.stackActiveBlock}`}
          >
            {currentBlockEntries.map((entry, i) => {
              const label = formatBlockValue(entry.categoryId, entry.value);
              return (
                <div key={`${entry.categoryId}-${i}-${label}`} className={Styles_conditionStack.stackActiveRow}>
                  <span className={Styles_conditionStack.stackActiveText}>{label}</span>
                  <button
                    onClick={() => onRemoveEntry(entry)}
                    className={Styles_conditionStack.stackActiveDelete}
                    title="Retirer cette valeur"
                  >
                    <IconTrash />
                  </button>
                </div>
              );
            })}
          </div>
          <button className={Styles_conditionStack.stackAddBtn} onClick={onConfirmBlock}>
            <IconPlus />
          </button>
        </div>
      ) : (
        <div className={`${Styles_conditionStack.stackItem} ${Styles_conditionStack.stackItemEmpty}`}>
          {orGroups.length > 0 ? '(Nouveau groupe ET)' : '(Choisissez une catégorie)'}
        </div>
      )}
    </div>
  );
}
