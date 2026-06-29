import { IconSelf } from '@assets/icons/IconSelf';
import { IconEnemy } from '@assets/icons/IconEnemy';
import { IconCharacter } from '@assets/icons/IconCharacter';

const TARGETS = [
  {
    id: 'SELF',
    label: 'Moi-même',
    sub: 'Mon propre personnage',
    description: 'Conditions qui s\'appliquent à votre état actuel',
    icon: <IconSelf className="w-10 h-10" />,
    accent: {
      border: 'hover:border-sky-500/70',
      bg: 'hover:bg-sky-500/8',
      glow: 'hover:shadow-[0_0_30px_rgba(14,165,233,0.15)]',
      iconBg: 'group-hover:bg-sky-500/20',
      iconColor: 'group-hover:text-sky-400',
      labelColor: 'group-hover:text-sky-300',
      dot: 'group-hover:bg-sky-400',
    },
  },
  {
    id: 'ENEMY',
    label: 'Ennemi',
    sub: 'Adversaire sur le champ de bataille',
    description: 'Conditions basées sur l\'état d\'un ennemi',
    icon: <IconEnemy className="w-10 h-10" />,
    accent: {
      border: 'hover:border-rose-500/70',
      bg: 'hover:bg-rose-500/8',
      glow: 'hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]',
      iconBg: 'group-hover:bg-rose-500/20',
      iconColor: 'group-hover:text-rose-400',
      labelColor: 'group-hover:text-rose-300',
      dot: 'group-hover:bg-rose-400',
    },
  },
  {
    id: 'ALLY',
    label: 'Allié',
    sub: 'Un membre de votre équipe',
    description: 'Conditions basées sur l\'état d\'un allié',
    icon: <IconCharacter className="w-10 h-10" />,
    accent: {
      border: 'hover:border-emerald-500/70',
      bg: 'hover:bg-emerald-500/8',
      glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
      iconBg: 'group-hover:bg-emerald-500/20',
      iconColor: 'group-hover:text-emerald-400',
      labelColor: 'group-hover:text-emerald-300',
      dot: 'group-hover:bg-emerald-400',
    },
  },
] as const;

interface TargetGridProps {
  onSelectTarget: (id: string) => void;
}

export function TargetGrid({ onSelectTarget }: TargetGridProps) {
  return (
    <div className="flex-1 flex flex-col justify-center gap-3 px-2">
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-600 mb-1 text-center">
        Sélectionner une cible
      </p>
      {TARGETS.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelectTarget(t.id)}
          className={`group relative flex items-center gap-5 px-6 py-4 rounded-2xl border border-slate-700/50 bg-[#161925]/70 transition-all duration-300 text-left ${t.accent.border} ${t.accent.bg} ${t.accent.glow} hover:-translate-y-0.5`}
        >
          {/* Icône */}
          <div className={`w-14 h-14 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center shrink-0 text-slate-500 transition-all duration-300 ${t.accent.iconBg} ${t.accent.iconColor}`}>
            {t.icon}
          </div>

          {/* Texte */}
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className={`text-base font-black uppercase tracking-widest text-slate-200 transition-colors duration-300 ${t.accent.labelColor}`}>
              {t.label}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 tracking-wide">
              {t.sub}
            </span>
            <span className="text-[10px] text-slate-600 mt-0.5">
              {t.description}
            </span>
          </div>

          {/* Flèche */}
          <svg
            className={`ml-auto w-4 h-4 shrink-0 text-slate-600 transition-all duration-300 group-hover:translate-x-1 ${t.accent.labelColor}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>

          {/* Point coloré en haut à droite */}
          <span className={`absolute top-3 right-3 w-2 h-2 rounded-full bg-slate-700 transition-colors duration-300 ${t.accent.dot}`} />
        </button>
      ))}
    </div>
  );
}
