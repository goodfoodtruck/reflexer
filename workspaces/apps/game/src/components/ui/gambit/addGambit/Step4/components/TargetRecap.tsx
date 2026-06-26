import { Fragment } from 'react';
import { IconEnemy } from '@assets/icons/IconEnemy';
import { IconCharacter } from '@assets/icons/IconCharacter';
import { IconSelf } from '@assets/icons/IconSelf';
import { IconEdit } from '@assets/icons/IconEdit';
import { IconTrash } from '@assets/icons/IconTrash';
import type { DraftGambit, DraftCondition, Scope } from '../../../GambitTypes';
import { ACTION_CATEGORIES } from '../../../actionCatalog';
import { sortToFullLabel, sortToCategoryLabel } from '../../../gambit.adapter';
import { formatBlockText } from '../../Step2/utils';
import { formatOrGroup } from '../useTargetStep';

/* ──────────────────────────────────────────────────────────── */

const SCOPE_META: Record<string, { label: string; icon: React.ReactNode; color: string; border: string; bg: string }> = {
  SELF:  { label: 'Moi-même', icon: <IconSelf className="w-4 h-4" />,      color: 'text-sky-300',     border: 'border-sky-500/50',     bg: 'bg-sky-500/10' },
  ENEMY: { label: 'Ennemi',   icon: <IconEnemy className="w-4 h-4" />,     color: 'text-rose-300',    border: 'border-rose-500/50',    bg: 'bg-rose-500/10' },
  ALLY:  { label: 'Allié',    icon: <IconCharacter className="w-4 h-4" />, color: 'text-emerald-300', border: 'border-emerald-500/50', bg: 'bg-emerald-500/10' },
};

const TARGET_ICONS: Record<string, React.ReactNode> = {
  SELF:  <IconSelf className="w-7 h-7" />,
  ENEMY: <IconEnemy className="w-7 h-7" />,
  ALLY:  <IconCharacter className="w-7 h-7" />,
};

/* ──────────────────────────────────────────────────────────── */

function OpBadge({ op }: { op: 'AND' | 'OR' }) {
  return (
    <span className={`self-start text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded border ${
      op === 'AND'
        ? 'border-slate-700/60 text-slate-500 bg-transparent'
        : 'border-amber-500/40 text-amber-400 bg-amber-500/10'
    }`}>
      {op === 'AND' ? 'ET' : 'OU'}
    </span>
  );
}

function ScopeBadge({ scope }: { scope: string }) {
  const meta = SCOPE_META[scope] ?? SCOPE_META.ENEMY;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${meta.color} ${meta.border} ${meta.bg}`}>
      {meta.icon}
      {meta.label}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────── */

function ConditionSection({ conditions }: { conditions: DraftCondition[] }) {
  if (conditions.length === 0) {
    return (
      <p className="text-[11px] text-slate-500 italic">Aucune condition — déclenché à chaque tour.</p>
    );
  }

  const byScope = new Map<Scope, DraftCondition[]>();
  for (const c of conditions) {
    const existing = byScope.get(c.scopeKind) ?? [];
    existing.push(c);
    byScope.set(c.scopeKind, existing);
  }
  const scopes = Array.from(byScope.entries());

  return (
    <div className="flex flex-col gap-3">
      {scopes.map(([scope, blocks], si) => (
        <Fragment key={scope}>
          {si > 0 && <OpBadge op="AND" />}
          <div className="flex flex-col gap-2 pl-3 border-l-2 border-slate-700/60">
            <ScopeBadge scope={scope} />
            {blocks.map((block, bi) => (
              <Fragment key={bi}>
                {bi > 0 && <OpBadge op={block.scopeOperator ?? 'AND'} />}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-300">
                    {formatBlockText(block.filterTypeCategory, block.blockValues, block.valuesOperator ?? 'OR')}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */

function ActionSection({ intentKind, intentValue }: { intentKind: string; intentValue: string }) {
  const allItems = ACTION_CATEGORIES.flatMap((c) => c.items);
  const item = allItems.find((i) => i.id === intentValue);
  const name = item?.name ?? intentValue;
  const image = item?.image;
  const cost = item?.cost;
  const effect = item?.effect;

  return (
    <div className="flex items-center gap-4 bg-[#0a0c13] border border-slate-700/50 rounded-xl p-4">
      <div className="shrink-0 w-14 h-14 rounded-xl border border-slate-700/50 bg-slate-800/60 flex items-center justify-center overflow-hidden">
        {image
          ? <img src={image} alt="" className="w-full h-full object-contain" />
          : <span className="text-2xl">{intentKind === 'MOVEMENT' ? '🏃' : '⚔'}</span>
        }
      </div>
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-sm font-black text-white uppercase tracking-widest truncate">{name}</span>
        <div className="flex items-center gap-3 flex-wrap">
          {cost !== undefined && (
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
              ⚡ {cost} énergie
            </span>
          )}
          {effect && (
            <span className="text-[10px] font-bold text-slate-400">{effect}</span>
          )}
          {!cost && !effect && (
            <span className="text-[10px] text-slate-500 italic">{intentKind === 'MOVEMENT' ? 'Déplacement' : 'Aucun effet listé'}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */

function TargetSection({ draft, onRemoveFilter }: { draft: DraftGambit; onRemoveFilter: (i: number) => void }) {
  const meta = SCOPE_META[draft.targetKind] ?? SCOPE_META.ENEMY;
  const fullSortLabel = sortToFullLabel(draft.targetSort);
  const categoryLabel = sortToCategoryLabel(draft.targetSort);
  const isSelf = draft.targetKind === 'SELF';
  const hasFilters = !isSelf && draft.targetFilters.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Ligne principale : cible → catégorie → tri */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${meta.color} ${meta.border} ${meta.bg} shrink-0`}>
          {TARGET_ICONS[draft.targetKind]}
          {meta.label}
        </span>
        {!isSelf && (
          <>
            <svg className="w-3 h-3 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
              {categoryLabel}
            </span>
            <svg className="w-3 h-3 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span className="text-sm font-black text-amber-400 tracking-wide">{fullSortLabel}</span>
          </>
        )}
      </div>

      {/* Filtres — cadre sémantique "éligibilité" */}
      {!isSelf && (
        <div className="flex flex-col gap-2">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
            {hasFilters ? 'Candidats éligibles (doivent vérifier)' : 'Candidats éligibles'}
          </span>

          {hasFilters ? (
            <div className="flex flex-col gap-1.5 pl-3 border-l-2 border-slate-700/60">
              {draft.targetFilters.map((group, i) => (
                <div key={i} className="group flex items-center gap-2">
                  {i > 0 && (
                    <span className="text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded border border-slate-700/60 text-slate-500 bg-transparent self-center">
                      ET
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-slate-200">
                    <span>{formatOrGroup(group)}</span>
                    <button
                      onClick={() => onRemoveFilter(i)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all ml-1 shrink-0"
                      title="Supprimer ce filtre"
                    >
                      <IconTrash className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 pl-3 border-l-2 border-slate-700/60">
              Aucun filtre — tous les {meta.label.toLowerCase()}s sont candidats.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */

interface RecapSectionProps { label: string; children: React.ReactNode }

function RecapSection({ label, children }: RecapSectionProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-600">{label}</span>
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */

interface TargetRecapProps {
  draft: DraftGambit;
  onEdit: () => void;
  onReset: () => void;
  onRemoveFilter: (index: number) => void;
}

export function TargetRecap({ draft, onEdit, onReset, onRemoveFilter }: TargetRecapProps) {
  const isSelf = draft.targetKind === 'SELF';

  return (
    <div className="flex-1 flex flex-col gap-5 overflow-y-auto custom-scrollbar pr-1">
      {/* Header : nom du gambit */}
      <div className="relative bg-[#0F111A] border border-amber-500/20 rounded-2xl px-6 py-5 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-amber-500/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-amber-500/40 via-amber-500/20 to-transparent" />
        <div className="relative flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] shrink-0" />
          <h2 className="text-lg font-black text-white uppercase tracking-widest truncate">{draft.name}</h2>
        </div>
      </div>

      {/* Corps : 3 sections */}
      <div className="flex flex-col gap-4">
        <RecapSection label="Quand">
          <div className="bg-[#0F111A] border border-slate-800/80 rounded-xl p-4">
            <ConditionSection conditions={draft.conditions} />
          </div>
        </RecapSection>

        <RecapSection label="Faire">
          <ActionSection intentKind={draft.intentKind} intentValue={draft.intentValue} />
        </RecapSection>

        <RecapSection label="Cibler">
          <div className="bg-[#0F111A] border border-slate-800/80 rounded-xl p-4">
            <TargetSection draft={draft} onRemoveFilter={onRemoveFilter} />
          </div>
        </RecapSection>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1 mt-auto">
        {!isSelf && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-amber-400 transition-colors px-4 py-2 rounded-lg border border-slate-700/50 hover:border-amber-500/40 bg-slate-800/40"
          >
            <IconEdit className="w-3.5 h-3.5" />
            Modifier la cible
          </button>
        )}
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-400 transition-colors px-4 py-2 rounded-lg border border-slate-700/50 hover:border-rose-500/40 bg-slate-800/40 ml-auto"
        >
          <IconTrash className="w-3.5 h-3.5" />
          Recommencer
        </button>
      </div>
    </div>
  );
}
