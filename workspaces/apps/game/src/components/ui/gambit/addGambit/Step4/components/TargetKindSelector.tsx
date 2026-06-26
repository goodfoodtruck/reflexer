import type { Scope } from '../../../GambitTypes';
import { IconEnemy } from '@assets/icons/IconEnemy';
import { IconCharacter } from '@assets/icons/IconCharacter';
import { IconSelf } from '@assets/icons/IconSelf';

const KINDS: {
  id: Scope;
  label: string;
  description: string;
  icon: React.ReactNode;
  activeClass: string;
}[] = [
  {
    id: 'ENEMY',
    label: 'Ennemi',
    description: 'Cibler un ennemi',
    icon: <IconEnemy className="w-6 h-6" />,
    activeClass: 'border-rose-500 bg-rose-500/10 text-rose-300',
  },
  {
    id: 'ALLY',
    label: 'Allié',
    description: 'Cibler un allié',
    icon: <IconCharacter className="w-6 h-6" />,
    activeClass: 'border-emerald-500 bg-emerald-500/10 text-emerald-300',
  },
  {
    id: 'SELF',
    label: 'Moi-même',
    description: 'Agir sur soi-même',
    icon: <IconSelf className="w-6 h-6" />,
    activeClass: 'border-sky-500 bg-sky-500/10 text-sky-300',
  },
];

interface Props {
  selectedKind: Scope | null;
  onSelect: (kind: Scope) => void;
}

export function TargetKindSelector({ selectedKind, onSelect }: Props) {
  return (
    <div className="flex gap-3">
      {KINDS.map((k) => {
        const isSelected = selectedKind === k.id;
        return (
          <button
            key={k.id}
            onClick={() => onSelect(k.id)}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl border text-left transition-all duration-150 flex-1 ${
              isSelected
                ? k.activeClass
                : 'border-slate-700/60 bg-slate-800/30 text-slate-500 hover:text-slate-300 hover:border-slate-600'
            }`}
          >
            
            <span className={isSelected ? '' : 'opacity-50'}>{k.icon}</span>
            <div>
              <div className="text-xs font-black uppercase tracking-widest">{k.label}</div>
              <div className="text-[10px] opacity-60 mt-0.5">{k.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
