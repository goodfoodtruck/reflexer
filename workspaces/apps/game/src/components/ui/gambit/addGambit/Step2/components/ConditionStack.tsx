import { Fragment } from 'react';
import { IconPlus } from '../../../../../../assets/icons/IconPlus';
import { IconTrash } from '../../../../../../assets/icons/IconTrash';
import type { ConditionBlock } from '../../../GambitTypes';
import {
  formatBlockValue,
  type FilterEntry,
} from '@components/ui/gambit/filters/filterRegistry';
import { Styles_conditionStack } from '../Condition.styles';
import { formatBlockText } from '../utils';

/** Icône "switch" indiquant que le bouton ET/OU est cliquable. */
function IconSwitch() {
  return (
    <svg viewBox="0 0 16 16" className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 5h12M11 2l3 3-3 3M14 11H2M5 8l-3 3 3 3" />
    </svg>
  );
}

interface ConditionStackProps {
  blocks: ConditionBlock[];
  blockOperators?: ('AND' | 'OR')[];
  currentCat: string | null;
  currentBlockEntries: FilterEntry[];
  onConfirmBlock: () => void;
  onRemoveBlock: (index: number) => void;
  onRemoveCurrentEntry: (entry: FilterEntry) => void;
  onToggleBlockOperator?: (index: number) => void;
  onToggleBlockValuesOperator?: (index: number) => void;
}

export function ConditionStack({
  blocks,
  blockOperators = [],
  currentBlockEntries,
  onConfirmBlock,
  onRemoveBlock,
  onRemoveCurrentEntry,
  onToggleBlockOperator,
  onToggleBlockValuesOperator,
}: ConditionStackProps) {
  return (
    <div className={Styles_conditionStack.stackWrapper}>
      {blocks.map((b, i) => {
        const op = blockOperators[i] ?? 'AND';
        const vop = b.valuesOperator ?? 'OR';
        const operatorBtnClass = `${Styles_conditionStack.stackOperatorBtn} ${
          op === 'OR' ? Styles_conditionStack.stackOperatorOr : Styles_conditionStack.stackOperatorAnd
        }`;
        return (
          <div key={i} className="flex flex-col items-center gap-3">
            <div className={`${Styles_conditionStack.stackItem} ${Styles_conditionStack.stackItemWithDelete}`}>
              {b.values.length > 1 ? (
                <div className="flex flex-wrap items-center gap-1 text-xs min-w-0">
                  {b.values.map((v, vi) => (
                    <Fragment key={vi}>
                      {vi > 0 && (
                        <button
                          onClick={() => onToggleBlockValuesOperator?.(i)}
                          className={`font-black uppercase text-[9px] px-1.5 py-0.5 rounded border shrink-0 transition-colors ${
                            vop === 'AND'
                              ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 hover:bg-sky-500/30'
                              : 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                          }`}
                          title="Cliquer pour basculer ET/OU"
                        >
                          {vop === 'AND' ? 'ET' : 'OU'}
                        </button>
                      )}
                      <span>{formatBlockValue(b.categoryId, v)}</span>
                    </Fragment>
                  ))}
                </div>
              ) : (
                <span>{formatBlockText(b.categoryId, b.values, vop)}</span>
              )}
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
                className={`${operatorBtnClass} flex items-center gap-1`}
                onClick={() => onToggleBlockOperator(i)}
                title="Cliquer pour basculer ET / OU"
              >
                <IconSwitch />
                {op === 'AND' ? 'ET' : 'OU'}
              </button>
            ) : (
              <span className={Styles_conditionStack.stackAnd}>ET</span>
            )}
          </div>
        );
      })}

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
                    onClick={() => onRemoveCurrentEntry(entry)}
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
          {blocks.length > 0 ? '(Nouveau groupe)' : '(Choisissez une catégorie)'}
        </div>
      )}
    </div>
  );
}
