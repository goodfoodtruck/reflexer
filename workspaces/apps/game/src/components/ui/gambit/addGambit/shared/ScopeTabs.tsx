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
  globalOp?: 'AND' | 'OR';
  onToggleGlobalOp?: () => void;
}

export function ScopeTabs({ activeScope, onSelect, conditionCounts, globalOp, onToggleGlobalOp }: Props) {
  const scopes: Scope[] = ['SELF', 'ALLY', 'ENEMY'];
  const scopesWithConditions = scopes.filter((s) => conditionCounts[s] > 0);

  return (
    <div className="flex items-center gap-2">
      {scopes.map((scope, i) => {
        const cfg = SCOPE_CONFIG[scope];
        const count = conditionCounts[scope];
        const isActive = activeScope === scope;

        // Show the inter-scope operator between two consecutive scopes that both have conditions
        const prevScope = scopes[i - 1];
        const showOp =
          i > 0 &&
          prevScope !== undefined &&
          conditionCounts[prevScope] > 0 &&
          count > 0 &&
          globalOp !== undefined &&
          onToggleGlobalOp !== undefined;

        return (
          <div key={scope} className="flex items-center gap-2">
            {showOp && (
              <button
                onClick={onToggleGlobalOp}
                title="Cliquer pour basculer ET / OU"
                className={`px-2.5 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest transition-all duration-150 ${
                  globalOp === 'AND'
                    ? 'border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/25'
                    : 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/25'
                }`}
              >
                {globalOp === 'AND' ? 'ET' : 'OU'}
              </button>
            )}

            <button
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
          </div>
        );
      })}

      {/* Non-adjacent scopes with conditions: show a single global op indicator */}
      {scopesWithConditions.length > 1 &&
        !scopes.some((s, i) => {
          const prev = scopes[i - 1];
          return prev !== undefined && conditionCounts[prev] > 0 && conditionCounts[s] > 0;
        }) &&
        globalOp !== undefined &&
        onToggleGlobalOp !== undefined && (
          <button
            onClick={onToggleGlobalOp}
            title="Cliquer pour basculer ET / OU entre les groupes"
            className={`ml-1 px-2.5 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest transition-all duration-150 ${
              globalOp === 'AND'
                ? 'border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/25'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/25'
            }`}
          >
            {globalOp === 'AND' ? 'ET' : 'OU'}
          </button>
        )}
    </div>
  );
}
