import { IconPlus } from '@assets/icons/IconPlus';
import { IconSelf } from '@assets/icons/IconSelf';
import { IconEnemy } from '@assets/icons/IconEnemy';
import { IconCharacter } from '@assets/icons/IconCharacter';

const TARGET_META: Record<string, { icon: React.ReactNode; color: string; border: string; bg: string; glow: string }> = {
  SELF: {
    icon: <IconSelf className="w-6 h-6" />,
    color: 'text-sky-400',
    border: 'border-sky-500/50',
    bg: 'bg-sky-500/15',
    glow: 'shadow-[0_0_14px_rgba(14,165,233,0.2)]',
  },
  ENEMY: {
    icon: <IconEnemy className="w-6 h-6" />,
    color: 'text-rose-400',
    border: 'border-rose-500/50',
    bg: 'bg-rose-500/15',
    glow: 'shadow-[0_0_14px_rgba(244,63,94,0.2)]',
  },
  ALLY: {
    icon: <IconCharacter className="w-6 h-6" />,
    color: 'text-emerald-400',
    border: 'border-emerald-500/50',
    bg: 'bg-emerald-500/15',
    glow: 'shadow-[0_0_14px_rgba(16,185,129,0.2)]',
  },
};

const LABELS: Record<string, string> = {
  SELF: 'Moi',
  ENEMY: 'Ennemi',
  ALLY: 'Allié',
};

interface TargetSummaryBarProps {
  configuredTargets: string[];
  onSelectTarget: (id: string) => void;
  onRemoveTarget: (id: string) => void;
}

export function TargetSummaryBar({ configuredTargets, onSelectTarget, onRemoveTarget }: TargetSummaryBarProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap mb-6 p-4 bg-[#0d1018] rounded-2xl border border-slate-800/60">
      {configuredTargets.map((t, i) => {
        const meta = TARGET_META[t] ?? TARGET_META['ENEMY']!;
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="relative group/target">
              <button
                onClick={() => onSelectTarget(t)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 cursor-pointer ${meta.color} ${meta.border} ${meta.bg} ${meta.glow} hover:opacity-90`}
              >
                {meta.icon}
                <span className="text-[10px] font-black uppercase tracking-widest">{LABELS[t] ?? t}</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onRemoveTarget(t); }}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-800 border border-slate-600 text-slate-400 hover:bg-rose-500 hover:border-rose-400 hover:text-white transition-all opacity-0 group-hover/target:opacity-100 flex items-center justify-center text-[10px] font-black leading-none z-10"
                title="Supprimer cette cible"
              >
                ×
              </button>
            </div>
            <span className="text-[10px] font-black tracking-[0.2em] text-slate-600 uppercase">ET</span>
          </div>
        );
      })}
      <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-slate-600 text-slate-500 bg-transparent hover:border-amber-500/50 hover:text-amber-500 hover:bg-amber-500/5 transition-all duration-200">
        <IconPlus className="w-4 h-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">Ajouter</span>
      </button>
    </div>
  );
}
