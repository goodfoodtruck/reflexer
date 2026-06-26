import type { Scope } from '../../GambitTypes';

const SCOPE_CONFIG: Record<Scope, { label: string; activeClass: string; dotClass: string }> = {
  SELF:  { label: 'Moi',    activeClass: 'border-sky-500     bg-sky-500/10     text-sky-300',     dotClass: 'bg-sky-400' },
  ALLY:  { label: 'Allié',  activeClass: 'border-emerald-500 bg-emerald-500/10 text-emerald-300', dotClass: 'bg-emerald-400' },
  ENEMY: { label: 'Ennemi', activeClass: 'border-rose-500    bg-rose-500/10    text-rose-300',    dotClass: 'bg-rose-400' },
};

interface Props {
  activeScope: Scope;
  onSelect: (scope: Scope) => void;
  conditionCounts: Record<Scope, number>;
}

export function ScopeTabs({ activeScope, onSelect, conditionCounts }: Props) {
  const scopes: Scope[] = ['SELF', 'ALLY', 'ENEMY'];

  return (
    <div className="flex gap-2">
      {scopes.map((scope) => {
        const cfg = SCOPE_CONFIG[scope];
        const count = conditionCounts[scope];
        const isActive = activeScope === scope;

        return (
          <button
            key={scope}
            onClick={() => onSelect(scope)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-black uppercase tracking-widest transition-all duration-150 ${
              isActive
                ? cfg.activeClass
                : 'border-slate-700/50 bg-transparent text-slate-500 hover:text-slate-300 hover:border-slate-600'
            }`}
          >
            {cfg.label}
            {count > 0 && (
              <span className={`flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-black ${
                isActive ? cfg.dotClass + ' text-slate-950' : 'bg-amber-500 text-slate-950'
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
