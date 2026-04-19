import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type UIGambit = {
  id: string;
  conditionLabel: string;
  targetLabel: string;
  actionLabel: string;
};

type GambitRowProps = {
  gambit: UIGambit;
  index: number;
};

const STYLES = {
  rowBase: "group relative flex items-center gap-3 p-2.5 rounded-xl border border-slate-700/50 transition-all duration-300",
  rowIdle: "bg-slate-900/40 hover:bg-slate-800/60 hover:border-slate-600 shadow-sm",
  rowDragging: "bg-amber-900/20 border-amber-500/50 shadow-[0_10px_30px_rgba(245,158,11,0.15)] scale-[1.02] z-50",
  dragHandle: "cursor-grab active:cursor-grabbing p-2 text-slate-600 hover:text-amber-500 focus-visible:outline-none transition-colors",
  priorityBadge: "w-7 h-7 flex-none flex items-center justify-center rounded-lg bg-slate-950 border border-slate-700 text-amber-500 font-black text-xs shadow-inner",
  slotContainer: "flex-1 flex items-center gap-2 bg-slate-950/60 border border-slate-700/50 pl-2 pr-3 py-1.5 rounded-lg shadow-inner",
  iconWrapper: "flex items-center justify-center w-6 h-6 rounded bg-slate-800 text-slate-400",
  slotText: "text-slate-300 text-xs font-bold tracking-wide truncate",
  arrow: "text-slate-600 flex-none",
  deleteBtn: "absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 p-1.5 bg-slate-800 hover:bg-red-900/80 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500 rounded-full transition-all shadow-lg"
};

export function GambitRow({ gambit, index }: GambitRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: gambit.id });

  const dynamicStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div ref={setNodeRef} style={dynamicStyle} className={`${STYLES.rowBase} ${isDragging ? STYLES.rowDragging : STYLES.rowIdle}`}>
      <button {...attributes} {...listeners} className={STYLES.dragHandle} aria-label={`Déplacer le gambit ${index}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"/></svg>
      </button>

      <div className={STYLES.priorityBadge}>{index}</div>

      <div className={STYLES.slotContainer}>
        <div className={STYLES.iconWrapper}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
        </div>
        <span className={STYLES.slotText}>{gambit.conditionLabel}</span>
      </div>

      <svg className={`w-4 h-4 ${STYLES.arrow}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>

      <div className={STYLES.slotContainer}>
        <div className={STYLES.iconWrapper}>
          <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        </div>
        <span className={STYLES.slotText}>{gambit.targetLabel}</span>
      </div>

      <svg className={`w-4 h-4 ${STYLES.arrow}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>

      <div className={STYLES.slotContainer}>
        <div className={STYLES.iconWrapper}>
          <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <span className={STYLES.slotText}>{gambit.actionLabel}</span>
      </div>

      <button className={STYLES.deleteBtn} aria-label="Supprimer">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
      
    </div>
  );
}