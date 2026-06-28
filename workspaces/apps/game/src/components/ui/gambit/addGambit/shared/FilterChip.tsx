import { Fragment } from 'react';
import type { BlockValue, CategoryId } from '@components/ui/gambit/filters/filterRegistry';
import { formatBlockValueShort } from '@components/ui/gambit/filters/filterRegistry';
import { CATEGORY_CHIP_STYLES, CATEGORY_LABELS, DEFAULT_CHIP_STYLE } from './filterChip.constants';
import { OperatorButton, StaticOperatorLabel } from './OperatorButton';

interface Props {
  categoryId: CategoryId;
  values: BlockValue[];
  isNegated: boolean;
  valuesOp: 'AND' | 'OR';
  onRemove: () => void;
  onToggleValuesOp?: () => void;
  onToggleNegated?: () => void;
}

export function FilterChip({
  categoryId,
  values,
  isNegated,
  valuesOp,
  onRemove,
  onToggleValuesOp,
  onToggleNegated,
}: Props) {
  const style = CATEGORY_CHIP_STYLES[categoryId] ?? DEFAULT_CHIP_STYLE;

  return (
    <div className="flex items-center gap-2 w-full">
      <NegationToggle isNegated={isNegated} onToggle={onToggleNegated} />

      <div className={`group flex items-center flex-1 rounded-lg border overflow-hidden bg-slate-900/60 transition-all duration-150 ${
        isNegated ? 'border-rose-500/30 opacity-60' : style.chip
      }`}>
        <div className={`flex items-center self-stretch px-2.5 py-2 border-r border-current/20 shrink-0 ${style.header}`}>
          <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
            {CATEGORY_LABELS[categoryId] ?? categoryId}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-x-1.5 gap-y-1 px-3 py-2 flex-1 min-w-0">
          {values.map((value, i) => (
            <Fragment key={i}>
              {i > 0 && (
                onToggleValuesOp
                  ? <OperatorButton op={valuesOp} onClick={onToggleValuesOp} />
                  : <StaticOperatorLabel op={valuesOp} />
              )}
              <span className="text-xs font-semibold text-slate-200 whitespace-nowrap">
                {formatBlockValueShort(categoryId, value)}
              </span>
            </Fragment>
          ))}
        </div>

        <button
          onClick={onRemove}
          title="Supprimer"
          className="flex items-center self-stretch px-2.5 opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 text-sm transition-all duration-150 border-l border-current/10 shrink-0"
        >
          ×
        </button>
      </div>
    </div>
  );
}

interface NegationToggleProps {
  isNegated: boolean;
  onToggle?: () => void;
}

function IconNot() {
  return (
    <svg
      viewBox="0 0 14 10"
      className="w-3 h-2.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M1 2h12v5" />
    </svg>
  );
}

function NegationToggle({ isNegated, onToggle }: NegationToggleProps) {
  if (!onToggle) return null;

  return (
    <button
      onClick={onToggle}
      title={isNegated ? 'Retirer la négation' : 'Inverser cette condition'}
      className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all duration-150 ${
        isNegated
          ? 'border-rose-500/50 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
          : 'border-dashed border-slate-700 text-slate-600 hover:border-rose-500/40 hover:text-rose-400 hover:bg-rose-500/8'
      }`}
    >
      <IconNot />
      NON
    </button>
  );
}
