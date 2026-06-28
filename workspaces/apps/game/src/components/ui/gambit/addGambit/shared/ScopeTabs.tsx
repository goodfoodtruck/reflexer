import type { Scope } from '@components/ui/gambit/GambitTypes';
import { OperatorButton } from './OperatorButton';

const SCOPE_CONFIG: Record<Scope, { label: string; activeClass: string; dotClass: string }> = {
  SELF:  { label: 'Moi',    activeClass: 'border-sky-500     bg-sky-500/10     text-sky-300',     dotClass: 'bg-sky-400' },
  ALLY:  { label: 'Allié',  activeClass: 'border-emerald-500 bg-emerald-500/10 text-emerald-300', dotClass: 'bg-emerald-400' },
  ENEMY: { label: 'Ennemi', activeClass: 'border-rose-500    bg-rose-500/10    text-rose-300',    dotClass: 'bg-rose-400' },
};

const ALL_SCOPES: Scope[] = ['SELF', 'ALLY', 'ENEMY'];

interface Props {
  activeScope: Scope;
  onSelect: (scope: Scope) => void;
  conditionCounts: Record<Scope, number>;
  globalOp?: 'AND' | 'OR';
  onToggleGlobalOp?: () => void;
}

function hasConditions(scope: Scope, counts: Record<Scope, number>): boolean {
  return counts[scope] > 0;
}

function areAdjacentWithConditions(scopes: Scope[], counts: Record<Scope, number>): boolean {
  return scopes.some((s, i) => {
    const prev = scopes[i - 1];
    return prev !== undefined && hasConditions(prev, counts) && hasConditions(s, counts);
  });
}

export function ScopeTabs({ activeScope, onSelect, conditionCounts, globalOp, onToggleGlobalOp }: Props) {
  const scopesWithConditions = ALL_SCOPES.filter((s) => hasConditions(s, conditionCounts));
  const showFallbackGlobalOp =
    scopesWithConditions.length > 1 &&
    !areAdjacentWithConditions(ALL_SCOPES, conditionCounts) &&
    globalOp !== undefined &&
    onToggleGlobalOp !== undefined;

  return (
    <div className="flex items-center gap-2">
      {ALL_SCOPES.map((scope, i) => {
        const cfg = SCOPE_CONFIG[scope];
        const isActive = activeScope === scope;

        const prevScope = ALL_SCOPES[i - 1];
        const showInlineOp =
          i > 0 &&
          prevScope !== undefined &&
          hasConditions(prevScope, conditionCounts) &&
          hasConditions(scope, conditionCounts) &&
          globalOp !== undefined &&
          onToggleGlobalOp !== undefined;

        return (
          <div key={scope} className="flex items-center gap-2">
            {showInlineOp && (
              <OperatorButton op={globalOp!} onClick={onToggleGlobalOp!} />
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
              {hasConditions(scope, conditionCounts) && (
                <span className={`flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-black ${
                  isActive ? cfg.dotClass + ' text-slate-950' : 'bg-amber-500 text-slate-950'
                }`}>
                  {conditionCounts[scope]}
                </span>
              )}
            </button>
          </div>
        );
      })}

      {showFallbackGlobalOp && (
        <OperatorButton
          op={globalOp!}
          onClick={onToggleGlobalOp!}
          title="Cliquer pour basculer ET / OU entre les groupes"
        />
      )}
    </div>
  );
}
