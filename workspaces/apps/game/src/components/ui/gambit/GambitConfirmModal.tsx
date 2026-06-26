import type { DraftGambit } from './GambitTypes';
import { formatConditionSummary, formatIntentSummary, formatTargetSummary } from './gambit.summary';
import { ACTION_CATEGORIES } from './actionCatalog';
import { sortToFullLabel } from './sorts/sortRegistry';
import { formatBlockValue } from './filters/filterRegistry';

interface Props {
  draft: DraftGambit;
  onConfirm: () => void;
  onCancel: () => void;
}

const SCOPE_LABEL: Record<string, string> = { SELF: 'Moi', ALLY: 'Allié', ENEMY: 'Ennemi' };

function resolveActionItem(draft: DraftGambit) {
  for (const cat of ACTION_CATEGORIES) {
    const found = cat.items.find((item) => item.id === draft.intentValue);
    if (found) return found;
  }
  return null;
}

export function GambitConfirmModal({ draft, onConfirm, onCancel }: Props) {
  const action = resolveActionItem(draft);
  const conditionSummary = formatConditionSummary(draft);
  const targetSummary = formatTargetSummary(draft);

  const byScope = new Map<string, { cat: string; value: string }[]>();
  for (const c of draft.conditions) {
    const list = byScope.get(c.scopeKind) ?? [];
    for (const v of c.blockValues) {
      list.push({ cat: c.filterTypeCategory, value: formatBlockValue(c.filterTypeCategory, v) });
    }
    byScope.set(c.scopeKind, list);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-amber-500/3 pointer-events-none" />

        <div className="relative px-6 pt-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-amber-500 rounded-full" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/70">Récapitulatif</p>
              <h2 className="text-base font-black text-white tracking-widest uppercase">{draft.name}</h2>
            </div>
          </div>
        </div>

        <div className="relative px-6 py-5 flex flex-col gap-5">
          <Section label="SI" empty={!conditionSummary}>
            {conditionSummary ? (
              <div className="flex flex-col gap-1.5">
                {Array.from(byScope.entries()).map(([scope, items]) => (
                  <div key={scope} className="flex items-start gap-2">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest shrink-0 mt-0.5 ${
                      scope === 'SELF'  ? 'bg-sky-500/15 text-sky-400' :
                      scope === 'ALLY'  ? 'bg-emerald-500/15 text-emerald-400' :
                                          'bg-rose-500/15 text-rose-400'
                    }`}>
                      {SCOPE_LABEL[scope] ?? scope}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {items.map((i) => i.value).join(' · ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic">Toujours actif — aucune condition</span>
            )}
          </Section>

          <Section label="FAIRE" empty={!draft.intentValue}>
            {action ? (
              <div className="flex items-center gap-3">
                {action.image && (
                  <img src={action.image} alt="" className="w-9 h-9 rounded-lg object-contain bg-slate-800 border border-slate-700 p-1 shrink-0" />
                )}
                <div>
                  <span className="text-sm font-bold text-slate-200">{action.name}</span>
                  {action.cost !== undefined && (
                    <span className="ml-2 text-[10px] font-black text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      {action.cost} ⚡
                    </span>
                  )}
                  {action.effect && (
                    <p className="text-[10px] text-slate-500 mt-0.5">{action.effect}</p>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic">Aucune action sélectionnée</span>
            )}
          </Section>

          <Section label="CIBLER" empty={!draft.targetKind}>
            {draft.targetKind ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${
                    draft.targetKind === 'SELF'  ? 'bg-sky-500/15 text-sky-400' :
                    draft.targetKind === 'ALLY'  ? 'bg-emerald-500/15 text-emerald-400' :
                                                   'bg-rose-500/15 text-rose-400'
                  }`}>
                    {SCOPE_LABEL[draft.targetKind]}
                  </span>
                  {draft.targetSort && draft.targetKind !== 'SELF' && (
                    <>
                      <span className="text-slate-700 text-xs">→</span>
                      <span className="text-xs font-semibold text-amber-400">{sortToFullLabel(draft.targetSort)}</span>
                    </>
                  )}
                </div>
                {draft.targetFilters.length > 0 && (
                  <div className="text-[10px] text-slate-500">
                    {draft.targetFilters.length} filtre{draft.targetFilters.length > 1 ? 's' : ''} actif{draft.targetFilters.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic">Aucune cible configurée</span>
            )}
          </Section>
        </div>

        <div className="relative px-6 pb-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
          >
            Modifier
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 text-xs font-black uppercase tracking-widest bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-lg transition-colors shadow-lg shadow-amber-500/20"
          >
            Confirmer & Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ label, empty, children }: { label: string; empty: boolean; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center pt-0.5">
        <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded ${
          empty
            ? 'bg-slate-800 text-slate-600'
            : 'bg-amber-500/15 text-amber-400'
        }`}>
          {label}
        </span>
        <div className="flex-1 w-px bg-slate-800 mt-1.5" />
      </div>
      <div className="flex-1 pb-2">{children}</div>
    </div>
  );
}
