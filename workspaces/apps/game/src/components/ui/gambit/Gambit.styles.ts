export const Style_gambit_edition = {
  container: 'h-full flex flex-col relative',
  header: 'px-8 py-6 border-b border-slate-700/50 bg-slate-800/30',
  timeline: 'absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-700 -z-10',
  stepWrapper: 'flex flex-col items-center gap-2 bg-slate-900 px-4 relative z-10',
  circle:
    'w-10 h-10 rounded-full font-black flex items-center justify-center border-4 border-slate-900 transition-colors duration-500',
  circleActive: 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
  circlePending: 'bg-slate-800 text-slate-500 font-bold',
  label: 'text-xs font-bold uppercase tracking-widest',
  labelActive: 'text-amber-500',
  labelPending: 'text-slate-500',
  body: 'flex-1 p-8 overflow-y-auto relative custom-scrollbar',
  glow: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none',
  content: 'relative z-10 mx-auto w-full pt-4 transition-all duration-500',
  footer: 'p-6 border-t border-slate-700/50 bg-slate-950/50 flex justify-between items-center',
  footerRight: 'flex items-center gap-4',
  btnBase: 'px-6 py-3 text-sm font-bold tracking-widest uppercase transition-all',
  btnCancel: 'text-slate-500 hover:text-rose-400',
  btnBack:
    'text-slate-400 bg-slate-800/50 border border-slate-700 hover:bg-slate-700 hover:text-white rounded-lg',
  btnNext:
    'px-8 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black rounded-lg shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed'
};

export const Styles_gambit_editor = {
  bgContainer: 'absolute inset-0 z-0',
  bgImage: 'w-full h-full object-cover opacity-60',
  container:
    'w-screen h-screen relative overflow-hidden flex flex-col text-slate-200 bg-black selection:bg-amber-500/30',
  bgHeroContainer:
    'absolute inset-0 z-0 flex items-end justify-end pr-90 pb-0 pointer-events-none overflow-hidden',
  bgHeroImageBase: 'max-h-[95vh] w-auto object-contain transition-all duration-1000 ease-in-out',
  bgHeroEditing: 'opacity-20 translate-x-10 scale-95 blur-[2px] drop-shadow-none',
  bgHeroIdle: 'opacity-90 translate-x-0 scale-80 drop-shadow-[0_0_50px_rgba(245,158,11,0.15)]',
  overlay:
    'absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/40 z-0',
  foreground: 'relative z-10 flex flex-col h-full',
  workspace: 'flex-1 flex gap-6 p-8 pt-0 min-h-0 overflow-hidden',
  rightPanelWizard:
    'flex-1 flex flex-col bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden transition-all duration-700 ease-in-out',
  rightPanelMemo:
    'w-[350px] ml-auto flex flex-col bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl p-8 transition-all duration-700 ease-in-out'
};

export const Styles_gambit_row = {
  containerBase: 'group relative flex flex-col rounded-xl border transition-all duration-200',
  containerDragging: 'bg-[#11131A] border-amber-500 shadow-xl scale-[1.02] z-50',
  containerOpen: 'bg-[#11131A] border-[#2A2E39] shadow-lg',
  containerClosed: 'bg-[#11131A] border-transparent hover:border-[#2A2E39]',
  headerArea: 'flex items-center gap-4 p-4 relative z-10',
  dragHandle:
    'text-slate-600 hover:text-amber-500 cursor-grab active:cursor-grabbing focus-visible:outline-none',
  priorityBadge:
    'w-7 h-7 rounded bg-[#0A0C10] border border-[#2A2E39] flex-none flex items-center justify-center text-amber-500 font-black text-xs',
  toggleArea:
    'flex-1 flex items-center justify-between focus-visible:outline-none text-left cursor-pointer',
  titleText:
    'text-slate-200 font-bold tracking-widest uppercase text-sm group-hover:text-white transition-colors',
  actionsWrapper: 'flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
  actionBtnEdit:
    'p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-md transition-colors',
  actionBtnDelete:
    'p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors',

  chevronIconBase:
    'w-5 h-5 text-slate-600 transition-transform duration-300 group-hover:text-amber-500',
  chevronIconOpen: 'rotate-180 text-amber-500',
  detailsPanel: 'mx-4 mb-4 mt-1 bg-[#0A0C10] rounded-lg border border-[#1A1D24] p-5',
  detailsGrid: 'grid grid-cols-[60px_1fr] gap-y-6 items-start',
  sectionLabel: 'text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2',
  logicConnectorArea: 'flex items-center gap-2 ml-4',
  logicConnectorLine: 'w-px h-3 bg-slate-700',
  logicConnectorText: 'text-[10px] font-black text-amber-500/80 tracking-widest uppercase',
  conditionBox:
    'flex items-center gap-3 bg-[#1A1D24] border border-[#2A2E39] rounded-md py-1.5 px-2 w-fit',
  conditionBadgeBase: 'text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded-sm',
  conditionSelf: 'bg-blue-500/15 text-blue-400',
  conditionEnemy: 'bg-red-500/15 text-red-400',
  conditionCharacter: 'bg-emerald-500/15 text-emerald-400',
  filterText: 'text-xs font-bold text-slate-200 pr-2',
  notContainer: 'flex flex-col gap-2',
  notBox:
    'flex items-center gap-2 bg-[#1A1D24] border border-red-500/20 rounded-md py-1 px-1.5 w-fit',
  notBadge:
    'text-[10px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-sm bg-red-500/10 text-red-500',
  targetSection: 'flex flex-col gap-2 min-w-0',
  targetArrow: 'w-4 h-4 text-slate-600',
  targetSortBadge:
    'text-xs font-black tracking-widest text-amber-500 uppercase bg-amber-500/10 px-3 py-1.5 rounded-md border border-amber-500/20',
  conditionGroupAnd: 'flex flex-col gap-2 pl-3 border-l-2 border-slate-700/60',
  conditionGroupOr: 'flex flex-col gap-2 pl-3 border-l-2 border-amber-500/35',
  intentBadgeBase:
    'text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-md border inline-block',
  intentMovement: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  intentAction: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
};

export const PanelStyles = {
  base: "flex flex-col bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden transition-all duration-700 ease-in-out relative",
  editing: "w-[30%] min-w-[400px]",
  idle: "w-[45%] min-w-[500px] ml-12",
  heroBanner: "flex-none flex items-center p-6 bg-gradient-to-r from-slate-900/80 to-transparent border-b border-slate-700/50 relative overflow-hidden",
  heroBannerGlow: "absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none",
  heroHeaderContent: "flex items-center gap-4 relative z-10",
  heroAvatar: "w-14 h-14 rounded-lg border border-amber-500/50 bg-slate-950/80 flex items-center justify-center text-amber-500 shadow-lg relative z-10",
  heroAvatarIcon: "w-7 h-7 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]",
  heroTitle: "text-xl font-black text-white tracking-widest uppercase drop-shadow-md",
  heroSubtitle: "text-[10px] text-amber-500 font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2",
  heroPulseDot: "w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse",
  listContainer: "flex-1 overflow-y-auto overflow-x-hidden p-5 space-y-3 custom-scrollbar",
  addButtonWrapper: "flex-none px-4 py-2 border-t border-slate-700/50 bg-transparent",
  addButton: "w-full py-3 bg-transparent text-slate-500 font-bold tracking-[0.2em] text-[10px] hover:text-amber-500 transition-colors focus-visible:outline-none uppercase flex justify-center items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed",
  addButtonIcon: "w-4 h-4",
};