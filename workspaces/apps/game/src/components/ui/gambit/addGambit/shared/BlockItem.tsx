import { Fragment } from 'react';
import type { ConditionBlock } from '../../GambitTypes';
import { formatBlockValue, type CategoryId } from '@components/ui/gambit/filters/filterRegistry';
import { Styles_conditionStack } from './blockStack.styles';
import { formatBlockText } from '../Step2/utils';

interface BlockItemProps {
  block: ConditionBlock;
  index: number;
  onRemove: (i: number) => void;
  onToggleValuesOperator?: (i: number) => void;
}

export function BlockItem({ block, index, onRemove, onToggleValuesOperator }: BlockItemProps) {
  const vop = block.valuesOperator ?? 'OR';
  return (
    <div className={`${Styles_conditionStack.stackItem} ${Styles_conditionStack.stackItemWithDelete}`}>
      {block.values.length > 1 ? (
        <div className="flex flex-wrap items-center gap-1 text-xs min-w-0">
          {block.values.map((v, vi) => (
            <Fragment key={vi}>
              {vi > 0 && (
                <button
                  onClick={() => onToggleValuesOperator?.(index)}
                  className={`font-black uppercase text-[9px] px-1.5 py-0.5 rounded border shrink-0 transition-colors ${
                    vop === 'AND'
                      ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 hover:bg-sky-500/30'
                      : 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                  }`}
                >
                  {vop === 'AND' ? 'ET' : 'OU'}
                </button>
              )}
              <span>{formatBlockValue(block.categoryId as CategoryId, v)}</span>
            </Fragment>
          ))}
        </div>
      ) : (
        <span>{formatBlockText(block.categoryId, block.values, vop)}</span>
      )}
      <button
        onClick={() => onRemove(index)}
        className={Styles_conditionStack.stackDeleteBtn}
        title="Supprimer ce bloc"
      >
        <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 6l8 8M14 6l-8 8" />
        </svg>
      </button>
    </div>
  );
}
