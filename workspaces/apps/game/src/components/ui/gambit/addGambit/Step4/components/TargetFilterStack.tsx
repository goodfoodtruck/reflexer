import { IconTrash } from '@assets/icons/IconTrash';
import type { CategoryId } from '@components/ui/gambit/filters/filterRegistry';
import type { FilterEntry, FilterOrGroup } from '../useTargetStep';
import { formatOrGroup } from '../useTargetStep';
import { Styles_conditionStack } from '../../shared/blockStack.styles';
import { PendingBlockView } from '../../shared/PendingBlockView';

interface TargetFilterStackProps {
  orGroups: FilterOrGroup[];
  currentBlockEntries: FilterEntry[];
  currentFilterCat: CategoryId | null;
  pendingValuesOperators: Record<string, 'AND' | 'OR'>;
  pendingGroupOperator: 'AND' | 'OR';
  onConfirmBlock: () => void;
  onRemoveBlock: (index: number) => void;
  onRemoveEntry: (entry: FilterEntry) => void;
  onTogglePendingValuesOperator: (categoryId: CategoryId) => void;
  onTogglePendingGroupOperator: () => void;
}

export function TargetFilterStack({
  orGroups,
  currentBlockEntries,
  pendingValuesOperators,
  pendingGroupOperator,
  onConfirmBlock,
  onRemoveBlock,
  onRemoveEntry,
  onTogglePendingValuesOperator,
  onTogglePendingGroupOperator,
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
        <PendingBlockView
          entries={currentBlockEntries}
          pendingValuesOperators={pendingValuesOperators}
          pendingGroupOperator={pendingGroupOperator}
          onRemoveEntry={onRemoveEntry}
          onConfirmBlock={onConfirmBlock}
          onTogglePendingValuesOperator={onTogglePendingValuesOperator}
          onTogglePendingGroupOperator={onTogglePendingGroupOperator}
        />
      ) : (
        <div className={`${Styles_conditionStack.stackItem} ${Styles_conditionStack.stackItemEmpty}`}>
          {orGroups.length > 0 ? '(Nouveau groupe ET)' : '(Choisissez une catégorie)'}
        </div>
      )}
    </div>
  );
}
