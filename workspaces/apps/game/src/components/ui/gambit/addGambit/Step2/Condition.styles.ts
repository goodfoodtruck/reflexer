export const Styles = {
  container: 'flex flex-col h-full',
  navHeader:
    'flex items-center gap-2 text-[11px] font-black text-slate-500 mb-8 uppercase tracking-[0.2em]',
  navActive: 'text-amber-500',
  navSeparator: 'text-slate-700',
  visualBar:
    'flex items-center gap-4 mb-8 p-5 bg-[#161925]/80 rounded-2xl border border-slate-700/50 shadow-inner',
  visualBox:
    'w-14 h-14 rounded-xl border flex items-center justify-center transition-all cursor-pointer relative',
  visualBoxFull:
    'border-amber-500/50 bg-gradient-to-br from-amber-500/20 to-transparent text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
  visualBoxAdd:
    'border-dashed border-slate-600 bg-[#0F111A] text-slate-500 hover:border-amber-500/50 hover:text-amber-500 hover:bg-amber-500/5',
  visualAnd: 'text-[10px] font-black text-slate-600 tracking-[0.2em] uppercase',
  divider: 'w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-8',
  gridWrapper: 'flex-1 flex flex-col items-center pt-8',
  gridTitle: 'text-2xl font-black text-white mb-8 tracking-wide',
  gridDisplay: 'grid grid-cols-4 gap-6',
  gridCard:
    'group relative w-36 aspect-square flex flex-col items-center justify-center gap-4 rounded-xl border border-slate-700/50 bg-[#161925]/60 cursor-pointer hover:border-amber-500/80 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] overflow-hidden transition-all duration-300 hover:-translate-y-1',
  gridIconBox:
    'relative w-16 h-16 rounded-xl bg-[#0F111A] border border-slate-700/50 flex items-center justify-center text-slate-500 transition-all duration-300 group-hover:text-amber-500 group-hover:border-amber-500/50 z-10',
  gridIconGlow:
    'absolute inset-0 bg-amber-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500',
  gridLabel:
    'text-[11px] font-black tracking-[0.1em] text-slate-400 uppercase group-hover:text-amber-400 z-10',
  banner:
    'relative w-full overflow-hidden bg-[#161925] border-l-4 border-amber-500 text-slate-200 font-black px-6 py-4 rounded-xl shadow-lg mb-8 flex items-center tracking-wide text-xs',
  bannerGlow: 'absolute top-0 left-1/4 w-1/2 h-full bg-amber-500/10 blur-3xl',
  workArea:
    'flex-1 bg-[#0F111A]/50 rounded-2xl border border-slate-800/50 p-6 flex flex-col justify-center relative overflow-hidden',
  workLayout: 'flex items-center gap-8 overflow-x-auto custom-scrollbar pb-6 px-2',
  focusIconWrapper: 'relative shrink-0',
  focusIconGlow: 'absolute inset-0 bg-amber-500/20 blur-2xl rounded-full',
  focusIconBox:
    'relative w-28 h-28 rounded-2xl bg-[#0F111A] border border-slate-700/50 shadow-2xl flex flex-col items-center justify-center text-amber-500 gap-2 z-10',
  listPane:
    'flex flex-col gap-2.5 w-60 shrink-0 h-[280px] overflow-y-auto custom-scrollbar pr-3 border-l border-slate-800/50 pl-8 relative',
  listItem:
    'relative w-full px-5 py-3.5 rounded-xl text-[11px] font-black cursor-pointer transition-all border overflow-hidden group tracking-[0.1em] uppercase',
  listSelected:
    'bg-amber-500 border-amber-400 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
  listIdle:
    'bg-[#161925] border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-200 hover:bg-slate-800/50',
  footer: 'flex justify-end gap-4 mt-auto pt-8 border-t border-slate-800/50',
  btnBase: 'px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all',
  btnSec:
    'text-slate-400 bg-slate-800/80 border border-slate-700 hover:bg-slate-700 hover:text-white',
  btnPri:
    'text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50 border border-orange-400/50'
};

export const Styles_conditionStack = {
  stackWrapper: 'flex flex-col items-center gap-3 shrink-0',
  stackItem:
    'px-5 py-3.5 rounded-xl text-[11px] font-black bg-[#161925] border border-slate-700/50 text-slate-300 text-center min-w-[160px] shadow-lg',
  stackItemActive: 'border-amber-500/40 bg-amber-500/10 text-amber-500 border-dashed',
  stackItemEmpty: 'border-dashed border-slate-700 bg-transparent text-slate-500 opacity-50',
  stackItemWithDelete: 'group relative flex items-center justify-between gap-2 pr-2',
  stackAnd: 'text-[10px] font-black text-slate-600 tracking-[0.2em] uppercase',
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