/* eslint-disable react-refresh/only-export-components */
import type { CategoryId } from './filterRegistry';

/** Icône cœur — PV / Santé */
export function IconHealth({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

/** Icône bouclier — Armure */
export function IconArmor({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6l-8-4z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4" />
    </svg>
  );
}

/** Icône éclair — Énergie */
export function IconEnergyBolt({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

/** Icône viseur/réticule — Distance de moi */
export function IconCrosshair({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="8" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
      <line x1="12" y1="2" x2="12" y2="6" strokeLinecap="round" strokeWidth="1.5" />
      <line x1="12" y1="18" x2="12" y2="22" strokeLinecap="round" strokeWidth="1.5" />
      <line x1="2" y1="12" x2="6" y2="12" strokeLinecap="round" strokeWidth="1.5" />
      <line x1="18" y1="12" x2="22" y2="12" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

/** Icône étoile — Passifs / Statuts */
export function IconPassive({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

/** Icône portée — À portée d'un allié */
export function IconRangeAlly({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

/** Icône portée ennemi — À portée d'un ennemi */
export function IconRangeEnemy({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="5" strokeWidth="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" strokeDasharray="3 2" d="M4.929 4.929A9 9 0 0119.07 19.07M19.07 4.929A9 9 0 014.93 19.07" />
    </svg>
  );
}

export type CategoryIconConfig = {
  icon: React.ReactNode;
  color: string;       // Tailwind text color class
  bg: string;          // Tailwind bg class (low opacity)
  border: string;      // Tailwind border class
  glow: string;        // Tailwind shadow/glow class
};

export const CATEGORY_ICON_CONFIG: Record<string, CategoryIconConfig> = {
  health: {
    icon: <IconHealth />,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    glow: 'shadow-[0_0_12px_rgba(244,63,94,0.2)]',
  },
  distance_ally: {
    icon: <IconRangeAlly />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.2)]',
  },
  distance_enemy: {
    icon: <IconRangeEnemy />,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    glow: 'shadow-[0_0_12px_rgba(249,115,22,0.2)]',
  },
  armor: {
    icon: <IconArmor />,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    glow: 'shadow-[0_0_12px_rgba(14,165,233,0.2)]',
  },
  energy: {
    icon: <IconEnergyBolt />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.2)]',
  },
  distance_me: {
    icon: <IconCrosshair />,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    glow: 'shadow-[0_0_12px_rgba(6,182,212,0.2)]',
  },
  status: {
    icon: <IconPassive />,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    glow: 'shadow-[0_0_12px_rgba(139,92,246,0.2)]',
  },
  in_range_of_ally: {
    icon: <IconRangeAlly />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.2)]',
  },
  in_range_of_enemy: {
    icon: <IconRangeEnemy />,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    glow: 'shadow-[0_0_12px_rgba(249,115,22,0.2)]',
  },
};

/** Retourne la config d'icône pour une CategoryId, avec un fallback générique. */
export function getCategoryIconConfig(categoryId: CategoryId | string): CategoryIconConfig {
  return CATEGORY_ICON_CONFIG[categoryId] ?? {
    icon: <IconPassive />,
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    glow: '',
  };
}
