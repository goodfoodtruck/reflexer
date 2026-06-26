import { motion } from 'framer-motion';
import { SORT_CATEGORIES } from '../../../sorts/sortRegistry';
import { getCategoryIconConfig } from '@components/ui/gambit/filters/categoryIcons';
import { Styles } from '../Target.styles';

interface StepSortPriorityProps {
  localKind: string | null;
  activeIcon: React.ReactNode;
  sortVal: string | null;
  sortCat: string | null;
  sortOptions: readonly string[];
  onSelectSortCat: (id: string) => void;
  onSelectSortVal: (val: string) => void;
  onBack: () => void;
  onSave: () => void;
}

const KIND_LABELS: Record<string, string> = { ENEMY: 'Ennemi', ALLY: 'Allié', SELF: 'Moi-même' };

export function StepSortPriority({
  localKind,
  activeIcon,
  sortVal,
  sortCat,
  sortOptions,
  onSelectSortCat,
  onSelectSortVal,
  onBack,
  onSave
}: StepSortPriorityProps) {
  const kindLabel = KIND_LABELS[localKind ?? ''] ?? localKind;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={Styles.container}
    >
      <div className={Styles.breadcrumb}>
        Critères &gt; <span className={Styles.activeBread}>Priorité</span>
      </div>
      <div className={Styles.headerBar}>
        {kindLabel}: <span className="text-slate-300">{sortVal || 'Sélectionnez un tri'}</span>
      </div>

      <div className={Styles.layoutCols}>
        <div className="flex flex-col items-center gap-2 min-w-50">
          <div className={Styles.smallIconBox}>{activeIcon}</div>
        </div>

        {/* Catégories de tri avec icônes */}
        <div className="flex flex-col gap-2 w-64 shrink-0 max-h-75 overflow-y-auto custom-scrollbar pr-1 border-l border-slate-800/50 pl-6">
          {SORT_CATEGORIES.map((cat) => {
            const isActive = sortCat === cat.id;
            const cfg = getCategoryIconConfig(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => onSelectSortCat(cat.id)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 text-left ${
                  isActive
                    ? `${cfg.bg} ${cfg.border} ${cfg.glow}`
                    : 'border-slate-700/40 bg-[#161925]/60 hover:border-slate-600 hover:bg-slate-800/50'
                }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive
                    ? `${cfg.bg} ${cfg.color}`
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {cfg.icon}
                </span>
                <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${
                  isActive ? cfg.color : 'text-slate-400 group-hover:text-slate-200'
                }`}>
                  {cat.label}
                </span>
                {isActive && (
                  <span className={`ml-auto w-1.5 h-1.5 rounded-full shrink-0 ${cfg.color.replace('text-', 'bg-')}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Options de tri pour la catégorie sélectionnée */}
        <div className="flex flex-col gap-2 w-64 shrink-0 max-h-75 overflow-y-auto custom-scrollbar pr-1 border-l border-slate-800/50 pl-6">
          {sortOptions.map((val) => (
            <button
              key={val}
              onClick={() => onSelectSortVal(val)}
              className={`px-3 py-2.5 rounded-xl text-[11px] font-black tracking-widest uppercase cursor-pointer transition-all border text-left ${
                sortVal === val
                  ? 'bg-amber-500 border-amber-400 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-[#161925] border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      <div className={Styles.footer}>
        <button onClick={onBack} className={`${Styles.btnBase} ${Styles.btnSecondary}`}>
          Retour
        </button>
        <button
          onClick={onSave}
          disabled={!sortVal}
          className={`${Styles.btnBase} ${Styles.btnPrimary}`}
        >
          Enregistrer
        </button>
      </div>
    </motion.div>
  );
}
