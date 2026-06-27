import { Fragment } from 'react';
import type { FilterOrGroup } from '../../../GambitTypes';
import { formatBlockValue } from '../../../filters/filterRegistry';

const CAT_STYLE: Record<string, { chip: string; header: string }> = {
  health:            { chip: 'border-rose-500/30   text-rose-200',   header: 'bg-rose-500/20   text-rose-300' },
  armor:             { chip: 'border-slate-500/30  text-slate-200',  header: 'bg-slate-500/20  text-slate-300' },
  energy:            { chip: 'border-yellow-500/30 text-yellow-200', header: 'bg-yellow-500/20 text-yellow-300' },
  status:            { chip: 'border-purple-500/30 text-purple-200', header: 'bg-purple-500/20 text-purple-300' },
  distance_me:       { chip: 'border-sky-500/30    text-sky-200',    header: 'bg-sky-500/20    text-sky-300' },
  in_range_of_ally:  { chip: 'border-emerald-500/30 text-emerald-200', header: 'bg-emerald-500/20 text-emerald-300' },
  in_range_of_enemy: { chip: 'border-orange-500/30  text-orange-200',  header: 'bg-orange-500/20  text-orange-300' },
};

const CAT_LABEL: Record<string, string> = {
  health:            'Santé',
  armor:             'Armure',
  energy:            'Énergie',
  status:            'Passif',
  distance_me:       'Distance',
  in_range_of_ally:  'Portée allié',
  in_range_of_enemy: 'Portée ennemi',
};

const DEFAULT_STYLE = { chip: 'border-slate-600/40 text-slate-200', header: 'bg-slate-700/50 text-slate-400' };

interface Props {
  filters: FilterOrGroup[];
  groupOps?: ('AND' | 'OR')[];
  valuesOps?: ('AND' | 'OR')[];
  onRemove: (index: number) => void;
  onToggleGroupOp?: (index: number) => void;
  onToggleValuesOp?: (index: number) => void;
}

export function TargetFilterList({
  filters,
  groupOps = [],
  valuesOps = [],
  onRemove,
  onToggleGroupOp,
  onToggleValuesOp,
}: Props) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((group, gi) => {
        const firstCat = group[0]?.categoryId ?? 'health';
        const style = CAT_STYLE[firstCat] ?? DEFAULT_STYLE;
        const groupOp = groupOps[gi - 1] ?? 'AND';
        const vop = valuesOps[gi] ?? 'OR';

        return (
          <Fragment key={gi}>
            {gi > 0 && (
              onToggleGroupOp ? (
                <button
                  onClick={() => onToggleGroupOp(gi - 1)}
                  title="Cliquer pour basculer ET / OU"
                  className={`px-2.5 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest transition-all duration-150 ${
                    groupOp === 'AND'
                      ? 'border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/25'
                      : 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/25'
                  }`}
                >
                  {groupOp === 'AND' ? 'ET' : 'OU'}
                </button>
              ) : (
                <span className="px-2.5 py-1 rounded-md border border-sky-500/40 bg-sky-500/10 text-[9px] font-black uppercase tracking-widest text-sky-400">
                  ET
                </span>
              )
            )}

            <div className={`group flex items-stretch rounded-lg border overflow-hidden bg-slate-900/60 ${style.chip}`}>
              <div className={`flex items-center px-2.5 py-1.5 ${style.header} border-r border-current/20`}>
                <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                  {CAT_LABEL[firstCat] ?? firstCat}
                </span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1.5">
                {group.map((entry, ei) => (
                  <Fragment key={ei}>
                    {ei > 0 && (
                      onToggleValuesOp ? (
                        <button
                          onClick={() => onToggleValuesOp(gi)}
                          title="Cliquer pour basculer ET / OU"
                          className={`px-1.5 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest transition-all duration-150 ${
                            vop === 'AND'
                              ? 'border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/25'
                              : 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/25'
                          }`}
                        >
                          {vop === 'AND' ? 'ET' : 'OU'}
                        </button>
                      ) : (
                        <span className={`text-[9px] font-black px-0.5 ${vop === 'AND' ? 'text-sky-400' : 'text-amber-400'}`}>
                          {vop === 'AND' ? 'ET' : 'OU'}
                        </span>
                      )
                    )}
                    <span className="text-xs font-semibold">
                      {formatBlockValue(entry.categoryId, entry.value)}
                    </span>
                  </Fragment>
                ))}
              </div>
              <button
                onClick={() => onRemove(gi)}
                className="flex items-center px-2 opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 text-xs transition-all duration-150 border-l border-current/10"
                title="Supprimer"
              >
                ×
              </button>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
