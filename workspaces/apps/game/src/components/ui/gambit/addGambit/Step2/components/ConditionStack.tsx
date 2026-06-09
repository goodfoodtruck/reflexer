import { IconPlus } from '../../../../../../assets/icons/IconPlus';
import { IconTrash } from '../../../../../../assets/icons/IconTrash';
import type { ConditionBlock } from '../../../GambitTypes';
import { Styles_conditionStack } from '../Condition.styles';
import { formatBlockText } from '../utils';

interface ConditionStackProps {
  blocks: ConditionBlock[];
  currentCat: string | null;
  currentValues: string[];
  onConfirmBlock: () => void;
  onRemoveBlock: (index: number) => void;
  onRemoveCurrentValue: (v: string) => void;
}

export function ConditionStack({
  blocks,
  currentCat,
  currentValues,
  onConfirmBlock,
  onRemoveBlock,
  onRemoveCurrentValue
}: ConditionStackProps) {
  return (
    <div className={Styles_conditionStack.stackWrapper}>
      {blocks.map((b, i) => (
        <div key={i} className="flex flex-col items-center gap-3">
          <div className={`${Styles_conditionStack.stackItem} ${Styles_conditionStack.stackItemWithDelete}`}>
            <span>{formatBlockText(b.categoryId, b.values)}</span>
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

      {currentValues.length > 0 ? (
        <div className="flex flex-col items-center gap-3 w-full">
          <div
            className={`${Styles_conditionStack.stackItem} ${Styles_conditionStack.stackItemActive} ${Styles_conditionStack.stackActiveBlock}`}
          >
            {currentValues.map((v) => (
              <div key={v} className={Styles_conditionStack.stackActiveRow}>
                <span className={Styles_conditionStack.stackActiveText}>{v}</span>
                <button
                  onClick={() => onRemoveCurrentValue(v)}
                  className={Styles_conditionStack.stackActiveDelete}
                  title="Retirer cette valeur"
                >
                  <IconTrash />
                </button>
              </div>
            ))}
          </div>
          <button className={Styles_conditionStack.stackAddBtn} onClick={onConfirmBlock}>
            <IconPlus />
          </button>
        </div>
      ) : (
        <div className={`${Styles_conditionStack.stackItem} ${Styles_conditionStack.stackItemEmpty}`}>
          (Choisissez une catégorie)
        </div>
      )}
    </div>
  );
}