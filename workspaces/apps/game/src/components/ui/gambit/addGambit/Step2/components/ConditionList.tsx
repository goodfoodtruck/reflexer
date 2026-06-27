import { Fragment } from 'react';
import type { DraftCondition, Scope } from '../../../GambitTypes';
import { formatBlockValue } from '../../../filters/filterRegistry';

const SCOPE_LABEL: Record<Scope, string> = {
  SELF: 'Moi',
  ALLY: 'Allié',
  ENEMY: 'Ennemi',
};

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
  in_range_of_ally:  'Portée',
  in_range_of_enemy: 'Portée ennemi',
};

const DEFAULT_STYLE = { chip: 'border-slate-600/40 text-slate-200', header: 'bg-slate-700/50 text-slate-400' };

interface Props {
  conditions: DraftCondition[];
  scope: Scope;
  onRemove: (id: string) => void;
  onToggleOperator?: (id: string) => void;
  onToggleValuesOperator?: (id: string) => void;
  onToggleNegated?: (id: string) => void;
}

export function ConditionList({ conditions, scope, onRemove, onToggleOperator, onToggleValuesOperator, onToggleNegated }: Props) {
  if (conditions.length === 0) {
    return (
      <p className="text-[10px] text-slate-600 italic py-2">
        Aucune condition pour{' '}
        <span className="text-slate-400 not-italic font-semibold">{SCOPE_LABEL[scope]}</span>{' '}
        — critère toujours satisfait.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {conditions.map((cond, i) => {
        const style = CAT_STYLE[cond.filterTypeCategory] ?? DEFAULT_STYLE;
        const prev = conditions[i - 1];
        const op = prev?.scopeOperator ?? 'AND';
        const vop = cond.valuesOperator ?? 'OR';

        return (
          <Fragment key={cond.id}>
            {i > 0 && (
              onToggleOperator ? (
                <button
                  onClick={() => onToggleOperator(prev!.id)}
                  title="Cliquer pour basculer ET / OU"
                  className={`px-2.5 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest transition-all duration-150 ${
                    op === 'AND'
                      ? 'border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/25'
                      : 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/25'
                  }`}
                >
                  {op === 'AND' ? 'ET' : 'OU'}
                </button>
              ) : (
                <span className="text-[9px] font-black tracking-widest uppercase text-slate-600 px-1">ET</span>
              )
            )}

            {/* NON toggle + chip — grouped so qu'ils restent solidaires dans le flex-wrap */}
            <div className="flex items-center gap-1.5">
              {onToggleNegated && (
                <button
                  onClick={() => onToggleNegated(cond.id)}
                  title={cond.negated ? 'Retirer la négation' : 'Inverser cette condition'}
                  className={`shrink-0 px-2.5 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all duration-150 ${
                    cond.negated
                      ? 'border-rose-500/50 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                      : 'border-dashed border-slate-700 text-slate-600 hover:border-rose-500/40 hover:text-rose-400 hover:bg-rose-500/8'
                  }`}
                >
                  NON
                </button>
              )}

              <div className={`group flex items-stretch rounded-lg border overflow-hidden bg-slate-900/60 transition-all duration-150 ${
                cond.negated ? 'border-rose-500/30 opacity-60' : style.chip
              }`}>
                <div className={`flex items-center px-2.5 py-1.5 border-r border-current/20 ${style.header}`}>
                  <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                    {CAT_LABEL[cond.filterTypeCategory] ?? cond.filterTypeCategory}
                  </span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1.5">
                  {cond.blockValues.map((v, vi) => (
                    <Fragment key={vi}>
                      {vi > 0 && (
                        onToggleValuesOperator ? (
                          <button
                            onClick={() => onToggleValuesOperator(cond.id)}
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
                      <span className="text-xs font-semibold">{formatBlockValue(cond.filterTypeCategory, v)}</span>
                    </Fragment>
                  ))}
                </div>
                <button
                  onClick={() => onRemove(cond.id)}
                  className="flex items-center px-2 opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 text-xs transition-all duration-150 border-l border-current/10"
                  title="Supprimer"
                >
                  ×
                </button>
              </div>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
