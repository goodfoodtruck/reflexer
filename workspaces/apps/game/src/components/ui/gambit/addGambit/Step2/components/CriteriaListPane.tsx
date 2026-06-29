import { getCategoryIconConfig } from '@components/ui/gambit/filters/categoryIcons';

interface Item {
  id: string;
  label: string;
}

interface CriteriaListPaneProps {
  items: readonly Item[] | readonly string[];
  selectedIds: string[];
  focusedIds?: string[];
  /** Afficher une icône par item (catégories). Mettre à false pour les listes de valeurs. */
  showIcons?: boolean;
  onSelect: (id: string) => void;
}

function getId(item: Item | string): string {
  return typeof item === 'string' ? item : item.id;
}

function getLabel(item: Item | string): string {
  return typeof item === 'string' ? item : item.label;
}

export function CriteriaListPane({ items, selectedIds, focusedIds, showIcons = true, onSelect }: CriteriaListPaneProps) {
  return (
    <div className="flex flex-col gap-2 w-64 shrink-0 max-h-75 overflow-y-auto custom-scrollbar pr-1 border-l border-slate-800/50 pl-6">
      {items.map((item) => {
        const id = getId(item);
        const label = getLabel(item);
        const isFocused = focusedIds?.includes(id) ?? false;
        const isSelected = !isFocused && selectedIds.includes(id);
        const cfg = showIcons ? getCategoryIconConfig(id) : null;

        if (isFocused) {
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 text-left bg-sky-500/15 border-sky-500/60 shadow-[0_0_14px_rgba(14,165,233,0.25)]"
            >
              {cfg && (
                <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-sky-500/20 text-sky-300">
                  {cfg.icon}
                </span>
              )}
              <span className="text-[11px] font-black uppercase tracking-widest text-sky-300">{label}</span>
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
            </button>
          );
        }

        if (isSelected) {
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 text-left ${cfg ? `${cfg.bg} ${cfg.border} ${cfg.glow}` : 'bg-amber-500/15 border-amber-500/50 shadow-[0_0_14px_rgba(245,158,11,0.2)]'}`}
            >
              {cfg && (
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}>
                  {cfg.icon}
                </span>
              )}
              <span className={`text-[11px] font-black uppercase tracking-widest ${cfg ? cfg.color : 'text-amber-400'}`}>{label}</span>
              {cfg && <span className={`ml-auto w-1.5 h-1.5 rounded-full shrink-0 ${cfg.color.replace('text-', 'bg-')}`} />}
            </button>
          );
        }

        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-700/40 bg-[#161925]/60 transition-all duration-200 text-left hover:border-slate-600 hover:bg-slate-800/50"
          >
            {cfg && (
              <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-slate-800 text-slate-500 transition-colors">
                {cfg.icon}
              </span>
            )}
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-200 transition-colors">
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
