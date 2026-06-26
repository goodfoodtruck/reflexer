export const Styles_conditionStack = {
  stackWrapper: 'flex flex-col items-center gap-3 shrink-0',
  stackItem:
    'px-5 py-3.5 rounded-xl text-[11px] font-black bg-[#161925] border border-slate-700/50 text-slate-300 text-center min-w-[160px] shadow-lg',
  stackItemActive: 'border-amber-500/40 bg-amber-500/10 text-amber-500 border-dashed',
  stackItemEmpty: 'border-dashed border-slate-700 bg-transparent text-slate-500 opacity-50',
  stackItemWithDelete: 'group relative flex items-center justify-between gap-2 pr-2',
  stackAnd: 'text-[10px] font-black text-slate-600 tracking-[0.2em] uppercase',
  stackOperatorBtn: 'text-[10px] font-black tracking-[0.2em] uppercase px-2 py-0.5 rounded transition-colors cursor-pointer border',
  stackOperatorAnd: 'text-slate-500 border-slate-700/50 hover:text-slate-300 hover:border-slate-600',
  stackOperatorOr: 'text-amber-400 border-amber-500/40 bg-amber-500/10 hover:text-amber-300',
  stackAddBtn:
    'w-full py-3 rounded-xl border border-dashed border-slate-600 text-slate-500 bg-[#0F111A] hover:bg-[#161925] hover:border-amber-500/50 hover:text-amber-500 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)] transition-all flex justify-center items-center cursor-pointer',
  stackDeleteBtn:
    'opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all shrink-0',
  stackActiveBlock: 'flex flex-col gap-1.5 items-start',
  stackActiveRow: 'flex items-center justify-between w-full gap-2 group/val',
  stackActiveText: 'text-[11px]',
  stackActiveDelete:
    'opacity-0 group-hover/val:opacity-100 text-amber-700 hover:text-rose-400 transition-all shrink-0'
};
