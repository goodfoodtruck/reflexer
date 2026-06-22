type ColorVariant = {
  border: string;
  emptyBorder: string;
  text: string;
  glow: string;
  badge: string;
  bar: string;
};

/** amber = joueur 1, sky = joueur 2 */
export const COLOR_VARIANTS: Record<'amber' | 'sky', ColorVariant> = {
  amber: {
    border: 'border-amber-400/50',
    emptyBorder: 'border-amber-500/15',
    text: 'text-amber-300',
    glow: 'shadow-[0_0_60px_rgba(251,191,36,0.12)]',
    badge: 'bg-amber-400 text-slate-900',
    bar: 'bg-amber-400'
  },
  sky: {
    border: 'border-sky-400/50',
    emptyBorder: 'border-sky-500/15',
    text: 'text-sky-300',
    glow: 'shadow-[0_0_60px_rgba(56,189,248,0.12)]',
    badge: 'bg-sky-400 text-slate-900',
    bar: 'bg-sky-400'
  }
};

/** Dégradé latéral selon que le panneau est à gauche ou à droite de l'écran. */
export const SIDE_GRADIENTS: Record<'left' | 'right', string> = {
  left: 'bg-gradient-to-r from-slate-950/50 to-transparent',
  right: 'bg-gradient-to-l from-slate-950/50 to-transparent'
};

export const GRID_ITEM_COLOR_VARIANTS: Record<
  'amber' | 'sky',
  { border: string; glow: string; badge: string }
> = {
  amber: {
    border: 'border-amber-400',
    glow: 'shadow-[inset_0_0_12px_rgba(251,191,36,0.45)]',
    badge: 'bg-amber-400 text-slate-900'
  },
  sky: {
    border: 'border-sky-400',
    glow: 'shadow-[inset_0_0_12px_rgba(56,189,248,0.45)]',
    badge: 'bg-sky-400 text-slate-900'
  }
};

// CharacterSelectScreen
export const SELECT_SCREEN_STYLES = {
  page: 'w-screen h-screen relative overflow-hidden flex flex-col text-slate-200 bg-black',

  bgWrapper: 'absolute inset-0 z-0 overflow-hidden',
  bgImage:
    'w-full h-full object-cover opacity-20 animate-[ambient-zoom_12s_ease-in-out_infinite_alternate]',
  bgOverlay:
    'absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950/75 to-slate-950/95 z-0 pointer-events-none',

  foreground: 'relative z-10 flex flex-col h-full',

  statusBar: 'text-center mt-1 mb-2',
  statusText: 'text-amber-500/80 text-[11px] font-bold tracking-[0.4em] uppercase animate-pulse',

  layout: 'flex-1 flex min-h-0 px-3 pb-3 gap-3',
  gridColumn: 'w-100 flex-none flex flex-col gap-2',

  confirmRow: 'flex justify-center flex-none',
  confirmButtonBase:
    'w-full py-2.5 rounded-xl font-black tracking-widest text-xs uppercase transition-colors duration-300',
  confirmButtonActive:
    'bg-amber-500 text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:bg-amber-400',
  confirmButtonDisabled:
    'bg-slate-800/70 text-slate-600 cursor-not-allowed border border-slate-700/60'
};

export const SELECT_SCREEN_KEYFRAMES = `
  @keyframes ambient-zoom {
    0%   { transform: scale(1.05) translate(0,0); }
    100% { transform: scale(1.15) translate(-1%,-1%); }
  }
  .roster-scroll::-webkit-scrollbar { width: 2px; }
  .roster-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
`;

// CharacterGrid
export const GRID_STYLES = {
  scrollWrapper: 'roster-scroll flex-1 overflow-y-auto min-h-0',
  gridLayout: 'grid grid-cols-3 gap-1.5 p-1'
};

// CharacterGridItem 
export const GRID_ITEM_STYLES = {
  tile: 'relative rounded-lg overflow-hidden cursor-pointer focus-visible:outline-none group',
  portraitImage: 'w-full h-full object-cover object-top',
  placeholderWrapper: 'w-full h-full bg-slate-800 flex items-center justify-center',
  placeholderText: 'text-slate-400 text-xs font-bold',

  hoverOverlay:
    'absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-100',

  borderBase: 'absolute inset-0 rounded-lg border-2 transition-colors duration-150',
  borderUnselected: 'border-transparent group-hover:border-slate-400/50',

  glowBase: 'absolute inset-0 rounded-lg',

  badgeBase:
    'absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black',

  nameBarWrapper:
    'absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/95 to-transparent px-1 py-0.5 translate-y-full group-hover:translate-y-0 transition-transform duration-150',
  nameBarText: 'text-[7px] font-bold text-white truncate text-center leading-tight'
};

// CharacterPanel
export const PANEL_STYLES = {
  container:
    'flex-1 flex flex-col rounded-xl border overflow-hidden transition-all duration-500 bg-slate-900/20 backdrop-blur-sm',

  header: 'flex-none px-4 py-2 flex items-center gap-2 border-b',
  slotBadge:
    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-none',
  slotBadgeEmpty: 'border border-slate-600 text-slate-500',
  labelText: 'text-[10px] font-bold tracking-widest text-slate-400 uppercase',

  body: 'flex-1 flex flex-col min-h-0',
  illustrationWrapper: 'relative flex-1 min-h-0 overflow-hidden',
  illustrationImageBase: 'w-full h-full object-cover object-top transition-opacity duration-300',
  illustrationOpacityPreview: 'opacity-45',
  illustrationOpacityActive: 'opacity-100',
  illustrationBottomFade:
    'absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-slate-950 to-transparent',
  previewLabelWrapper: 'absolute bottom-2 inset-x-0 text-center',
  previewLabelText: 'text-[9px] text-slate-500 tracking-widest uppercase',

  statsWrapper: 'flex-none px-4 py-3 bg-slate-950/90 space-y-2',
  nameBase: 'text-sm font-black tracking-wide leading-tight',
  nameMuted: 'text-slate-400',
  description: 'text-[9px] text-slate-400 leading-relaxed line-clamp-2',
  statsRows: 'space-y-1.5 pt-0.5',

  emptyState: 'flex-1 flex flex-col items-center justify-center gap-3 text-slate-700',
  emptyIconWrapper:
    'w-12 h-12 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center',
  emptyIconText: 'text-xl font-black',
  emptyLabel: 'text-[10px] tracking-widest text-center uppercase'
};

// StatRow 
export const STAT_ROW_STYLES = {
  row: 'flex items-center gap-2',
  label: 'text-[8px] font-bold text-slate-500 tracking-widest w-12 flex-none uppercase',
  track: 'flex-1 h-1 bg-slate-800 rounded-full overflow-hidden',
  fillBase: 'h-full rounded-full',
  value: 'text-[9px] font-bold w-5 text-right flex-none'
};
