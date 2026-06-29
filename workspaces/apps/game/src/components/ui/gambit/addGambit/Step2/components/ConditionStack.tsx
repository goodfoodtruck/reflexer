import type { ConditionBlock } from '@components/ui/gambit/GambitTypes';
import { type CategoryId, type FilterEntry } from '@components/ui/gambit/filters/filterRegistry';
import { Styles_conditionStack } from '@components/ui/gambit/addGambit/shared/blockStack.styles';
import { PendingBlockView } from '@components/ui/gambit/addGambit/shared/PendingBlockView';
import { BlockItem } from '@components/ui/gambit/addGambit/shared/BlockItem';
import { OpToggle } from '@components/ui/gambit/addGambit/shared/OpToggle';

interface ConditionStackProps {
  blocks: ConditionBlock[];
  blockOperators?: ('AND' | 'OR')[];
  currentBlockEntries: FilterEntry[];
  pendingValuesOperators: Record<string, 'AND' | 'OR'>;
  pendingGroupOperator: 'AND' | 'OR';
  onConfirmBlock: () => void;
  onRemoveBlock: (index: number) => void;
  onRemoveCurrentEntry: (entry: FilterEntry) => void;
  onToggleBlockOperator?: (index: number) => void;
  onToggleBlockValuesOperator?: (index: number) => void;
  onTogglePendingValuesOperator: (categoryId: CategoryId) => void;
  onTogglePendingGroupOperator: () => void;
}

export function ConditionStack({
  blocks,
  blockOperators = [],
  currentBlockEntries,
  pendingValuesOperators,
  pendingGroupOperator,
  onConfirmBlock,
  onRemoveBlock,
  onRemoveCurrentEntry,
  onToggleBlockOperator,
  onToggleBlockValuesOperator,
  onTogglePendingValuesOperator,
  onTogglePendingGroupOperator,
}: ConditionStackProps) {
  const interBlockOps = blockOperators.slice(0, blocks.length - 1);
  const hasMixedOps =
    interBlockOps.length > 0 && interBlockOps.some((op) => op !== interBlockOps[0]);

  const andGroups: number[][] = [];
  const orSepIndices: number[] = [];
  if (blocks.length > 0) {
    let cur: number[] = [0];
    for (let i = 0; i < blocks.length - 1; i++) {
      if ((interBlockOps[i] ?? 'AND') === 'OR') {
        andGroups.push(cur);
        orSepIndices.push(i);
        cur = [i + 1];
      } else {
        cur.push(i + 1);
      }
    }
    andGroups.push(cur);
  }

  const pendingSepOp = blockOperators[blocks.length - 1] ?? 'AND';

  return (
    <div className={Styles_conditionStack.stackWrapper}>
      {hasMixedOps ? (
        andGroups.map((groupIndices, gi) => (
          <div key={gi} className="flex flex-col items-center gap-3 w-full">
            {gi > 0 && onToggleBlockOperator ? (
              <OpToggle op="OR" onClick={() => onToggleBlockOperator(orSepIndices[gi - 1]!)} />
            ) : gi > 0 ? (
              <span className={`${Styles_conditionStack.stackOperatorBtn} ${Styles_conditionStack.stackOperatorOr}`}>OU</span>
            ) : null}

            <div
              className={
                groupIndices.length > 1
                  ? 'w-full border border-sky-900/40 rounded-xl bg-sky-500/5 p-2 flex flex-col items-center gap-2'
                  : 'w-full flex flex-col items-center gap-2'
              }
            >
              {groupIndices.map((blockIdx, li) => (
                <div key={blockIdx} className="flex flex-col items-center gap-2 w-full">
                  {li > 0 && onToggleBlockOperator ? (
                    <OpToggle op="AND" onClick={() => onToggleBlockOperator(blockIdx - 1)} />
                  ) : li > 0 ? (
                    <span className={`${Styles_conditionStack.stackOperatorBtn} ${Styles_conditionStack.stackOperatorAnd}`}>ET</span>
                  ) : null}
                  <BlockItem
                    block={blocks[blockIdx]!}
                    index={blockIdx}
                    onRemove={onRemoveBlock}
                    onToggleValuesOperator={onToggleBlockValuesOperator}
                  />
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        blocks.map((b, i) => {
          const op = blockOperators[i] ?? 'AND';
          return (
            <div key={i} className="flex flex-col items-center gap-3">
              <BlockItem
                block={b}
                index={i}
                onRemove={onRemoveBlock}
                onToggleValuesOperator={onToggleBlockValuesOperator}
              />
              {onToggleBlockOperator ? (
                <OpToggle op={op} onClick={() => onToggleBlockOperator(i)} />
              ) : (
                <span className={Styles_conditionStack.stackAnd}>ET</span>
              )}
            </div>
          );
        })
      )}

      {currentBlockEntries.length > 0 ? (
        <>
          {blocks.length > 0 && hasMixedOps && (
            onToggleBlockOperator ? (
              <OpToggle op={pendingSepOp} onClick={() => onToggleBlockOperator(blocks.length - 1)} />
            ) : (
              <span className={Styles_conditionStack.stackAnd}>ET</span>
            )
          )}
          <PendingBlockView
            entries={currentBlockEntries}
            pendingValuesOperators={pendingValuesOperators}
            pendingGroupOperator={pendingGroupOperator}
            onRemoveEntry={onRemoveCurrentEntry}
            onConfirmBlock={onConfirmBlock}
            onTogglePendingValuesOperator={onTogglePendingValuesOperator}
            onTogglePendingGroupOperator={onTogglePendingGroupOperator}
          />
        </>
      ) : (
        <>
          {blocks.length > 0 && hasMixedOps && (
            onToggleBlockOperator ? (
              <OpToggle op={pendingSepOp} onClick={() => onToggleBlockOperator(blocks.length - 1)} />
            ) : (
              <span className={Styles_conditionStack.stackAnd}>ET</span>
            )
          )}
          <div className={`${Styles_conditionStack.stackItem} ${Styles_conditionStack.stackItemEmpty}`}>
            {blocks.length > 0 ? '(Nouveau groupe)' : '(Choisissez une catégorie)'}
          </div>
        </>
      )}
    </div>
  );
}
