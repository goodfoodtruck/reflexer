import { IconPlus } from '../../../../../../assets/icons/IconPlus';
import { IconTrash } from '../../../../../../assets/icons/IconTrash';
import type { ConditionBlock } from '../../../GambitTypes';
import {
  formatBlockValue,
  type BlockValue,
  type CategoryId,
} from '@components/ui/gambit/filters/filterRegistry';
import { Styles_conditionStack } from '../Condition.styles';
import { formatBlockText } from '../utils';

interface ConditionStackProps {
  blocks: ConditionBlock[];
  blockOperator?: 'AND' | 'OR';
  currentCat: CategoryId | null;
  currentValues: BlockValue[];
  onConfirmBlock: () => void;
  onRemoveBlock: (index: number) => void;
  onRemoveCurrentValue: (v: BlockValue) => void;
  onToggleBlockOperator?: () => void;
}

export function ConditionStack({
  blocks,
  blockOperator = 'AND',
  currentCat,
  currentValues,
  onConfirmBlock,
  onRemoveBlock,
  onRemoveCurrentValue,
  onToggleBlockOperator,
}: ConditionStackProps) {
  const operatorBtnClass = `${Styles_conditionStack.stackOperatorBtn} ${
    blockOperator === 'OR' ? Styles_conditionStack.stackOperatorOr : Styles_conditionStack.stackOperatorAnd
  }`;

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
          {onToggleBlockOperator ? (
            <button
              className={operatorBtnClass}
              onClick={onToggleBlockOperator}
              title="Cliquer pour basculer ET / OU"
            >
              {blockOperator === 'AND' ? 'ET' : 'OU'}
            </button>
          ) : (
            <span className={Styles_conditionStack.stackAnd}>ET</span>
          )}
        </div>
      ))}

      {currentCat && currentValues.length > 0 ? (
        <div className="flex flex-col items-center gap-3 w-full">
          <div
            className={`${Styles_conditionStack.stackItem} ${Styles_conditionStack.stackItemActive} ${Styles_conditionStack.stackActiveBlock}`}
          >
            {currentValues.map((v, i) => {
              const label = formatBlockValue(currentCat, v);
              return (
                <div key={`${currentCat}-${i}-${label}`} className={Styles_conditionStack.stackActiveRow}>
                  <span className={Styles_conditionStack.stackActiveText}>{label}</span>
                  <button
                    onClick={() => onRemoveCurrentValue(v)}
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
          (Choisissez une catégorie)
        </div>
      )}
    </div>
  );
}