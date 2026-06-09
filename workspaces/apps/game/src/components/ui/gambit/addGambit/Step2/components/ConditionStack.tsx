import { IconPlus } from '../../../../../../assets/icons/IconPlus';
import type { ConditionBlock } from '../../../GambitTypes';
import { Styles } from '../Condition.styles';
import { formatBlockText } from '../utils';

interface ConditionStackProps {
  blocks: ConditionBlock[];
  currentCat: string | null;
  currentValues: string[];
  onConfirmBlock: () => void;
}

export function ConditionStack({
  blocks,
  currentCat,
  currentValues,
  onConfirmBlock,
}: ConditionStackProps) {
  return (
    <div className={Styles.stackWrapper}>
      {blocks.map((b, i) => (
        <div key={i} className="flex flex-col items-center gap-3">
          <div className={Styles.stackItem}>{formatBlockText(b.categoryId, b.values)}</div>
          <span className={Styles.stackAnd}>ET</span>
        </div>
      ))}

      {currentValues.length > 0 ? (
        <div className="flex flex-col items-center gap-3 w-full">
          <div className={`${Styles.stackItem} ${Styles.stackItemActive}`}>
            {formatBlockText(currentCat!, currentValues)}
          </div>
          <button className={Styles.stackAddBtn} onClick={onConfirmBlock}>
            <IconPlus />
          </button>
        </div>
      ) : (
        <div className={`${Styles.stackItem} ${Styles.stackItemEmpty}`}>
          (Choisissez une catégorie)
        </div>
      )}
    </div>
  );
}