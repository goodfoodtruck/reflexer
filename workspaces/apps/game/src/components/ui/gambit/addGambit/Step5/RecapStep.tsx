import { Fragment } from 'react';
import { motion } from 'framer-motion';
import type { DraftGambit, DraftCondition } from '../../GambitTypes';
import { formatBlockValue } from '../../filters/filterRegistry';
import { sortToFullLabel } from '../../gambit.adapter';
import { ACTION_CATEGORIES } from '../../actionCatalog';

/* ── Constants ─────────────────────────────────────────────────────────── */

const SCOPE_LABEL: Record<string, string> = {
  SELF: 'Moi-même',
  ALLY: 'Allié',
  ENEMY: 'Ennemi',
};

const SCOPE_COLOR: Record<string, string> = {
  SELF:  'bg-sky-500/15 text-sky-300 border-sky-500/25',
  ALLY:  'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  ENEMY: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
};

const STRATEGY_LABELS: Record<string, string> = {
  APPROACH: 'Chargez !',
  FLEE:     'Fuite',
  STAY:     'Tenir la position',
};

function resolveAction(draft: DraftGambit) {
  for (const cat of ACTION_CATEGORIES) {
    const found = cat.items.find((item) => item.id === draft.intentValue);
    if (found) return found;
  }
  return null;
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function SectionDivider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-slate-800" />
      <svg className="w-3 h-3 text-slate-700 shrink-0" viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
      <div className="flex-1 h-px bg-slate-800" />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
      {children}
    </span>
  );
}

function OpBadge({ op }: { op: 'AND' | 'OR' }) {
  return (
    <span className={`self-start text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
      op === 'AND'
        ? 'border-slate-700 text-slate-500 bg-transparent'
        : 'border-amber-500/30 text-amber-400 bg-amber-500/8'
    }`}>
      {op === 'AND' ? 'ET' : 'OU'}
    </span>
  );
}

function ConditionLine({ cond }: { cond: DraftCondition }) {
  const scopeColor = SCOPE_COLOR[cond.scopeKind] ?? SCOPE_COLOR.SELF;
  const vop = cond.valuesOperator ?? 'OR';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border shrink-0 ${scopeColor}`}>
        {SCOPE_LABEL[cond.scopeKind]}
      </span>
      <span className="text-sm font-semibold text-slate-200">
        {cond.blockValues.map((v, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <span className={`text-[9px] font-black mx-1.5 ${vop === 'AND' ? 'text-sky-400' : 'text-amber-400'}`}>
                {vop === 'AND' ? 'ET' : 'OU'}
              </span>
            )}
            {formatBlockValue(cond.filterTypeCategory, v)}
          </Fragment>
        ))}
      </span>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────── */

interface Props {
  draft: DraftGambit;
}

export function RecapStep({ draft }: Props) {
  const hasConditions = draft.conditions.length > 0;
  const action = resolveAction(draft);
  const isMovement = draft.intentKind === 'MOVEMENT';
  const targetColor = SCOPE_COLOR[draft.targetKind] ?? SCOPE_COLOR.ENEMY;

  /* group conditions in display order */
  const conditionsByScope = draft.conditions.reduce<Map<string, DraftCondition[]>>(
    (acc, c) => {
      const list = acc.get(c.scopeKind) ?? [];
      list.push(c);
      acc.set(c.scopeKind, list);
      return acc;
    },
    new Map(),
  );

  const scopeGroups = Array.from(conditionsByScope.entries());
  const globalOp = draft.operator;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 max-w-xl mx-auto"
    >
      {/* Header */}
      <div className="mb-2">
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-amber-500/60 mb-1">Récapitulatif</p>
        <h2 className="text-xl font-black text-white">{draft.name}</h2>
      </div>

      {/* Rule card */}
      <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden">

        {/* ── SI ── */}
        <div className="flex flex-col gap-3 px-5 py-4">
          <SectionLabel>Déclenchement</SectionLabel>

          {!hasConditions ? (
            <p className="text-sm text-slate-500 italic">Toujours actif — aucune condition définie.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {scopeGroups.map(([scope, conds], gi) => (
                <Fragment key={scope}>
                  {/* operator between scope groups */}
                  {gi > 0 && <OpBadge op={globalOp} />}

                  {/* conditions within this scope */}
                  {conds.map((cond, ci) => (
                    <Fragment key={cond.id}>
                      {ci > 0 && <OpBadge op={cond.scopeOperator ?? 'AND'} />}
                      <ConditionLine cond={cond} />
                    </Fragment>
                  ))}
                </Fragment>
              ))}
            </div>
          )}
        </div>

        <SectionDivider />

        {/* ── FAIRE ── */}
        <div className="flex flex-col gap-3 px-5 py-4">
          <SectionLabel>Action</SectionLabel>

          {isMovement ? (
            <p className="text-sm font-semibold text-slate-200">
              {STRATEGY_LABELS[draft.intentValue] ?? draft.intentValue}
            </p>
          ) : action ? (
            <div className="flex items-center gap-3">
              {action.image && (
                <img
                  src={action.image}
                  alt=""
                  className="w-11 h-11 rounded-xl object-contain bg-slate-900 border border-slate-800 p-1 shrink-0"
                />
              )}
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-100">{action.name}</span>
                  {action.cost !== undefined && (
                    <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {action.cost} ⚡
                    </span>
                  )}
                </div>
                {action.effect && (
                  <p className="text-[11px] text-slate-500 leading-snug">{action.effect}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Aucune action.</p>
          )}
        </div>

        <SectionDivider />

        {/* ── CIBLE ── */}
        <div className="flex flex-col gap-3 px-5 py-4">
          <SectionLabel>Cible</SectionLabel>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${targetColor}`}>
                {SCOPE_LABEL[draft.targetKind] ?? draft.targetKind}
              </span>
              {draft.targetSort && draft.targetKind !== 'SELF' && (
                <span className="text-sm font-semibold text-slate-300">
                  {sortToFullLabel(draft.targetSort)}
                </span>
              )}
            </div>

            {draft.targetKind !== 'SELF' && draft.targetFilters.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-0.5">
                {draft.targetFilters.map((group, gi) => (
                  <div key={gi} className="flex items-center gap-1.5 flex-wrap">
                    {gi > 0 && (
                      <span className="text-[9px] font-black uppercase tracking-widest border border-slate-700 text-slate-500 px-1.5 py-0.5 rounded">
                        ET
                      </span>
                    )}
                    {group.map((entry, ei) => (
                      <Fragment key={ei}>
                        {ei > 0 && (
                          <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest border border-amber-500/30 bg-amber-500/8 px-1.5 py-0.5 rounded">
                            OU
                          </span>
                        )}
                        <span className="text-xs text-slate-300 font-medium">
                          {formatBlockValue(entry.categoryId, entry.value)}
                        </span>
                      </Fragment>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
