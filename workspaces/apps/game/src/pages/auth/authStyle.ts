export const STYLES = {
  container:
    'w-screen h-screen font-sans relative overflow-hidden flex flex-col items-center justify-center selection:bg-amber-500/30 bg-black',
  bgContainer: 'absolute inset-0 z-0',
  bgImage: 'w-full h-full object-cover opacity-40',
  overlay:
    'absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-slate-950/90 z-0 pointer-events-none',
  heroContainer:
    'absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] pointer-events-none opacity-20',
  heroImage: 'w-full h-full object-contain',
  card: 'relative z-10 w-full max-w-sm flex flex-col gap-6',
  title:
    'text-5xl font-black tracking-widest text-center text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700',
  subtitle: 'text-amber-500/70 tracking-[0.5em] text-xs uppercase font-bold text-center',
  tabs: 'flex border border-slate-700/50 rounded-xl overflow-hidden',
  tabActive:
    'flex-1 py-3 text-xs font-black tracking-widest uppercase bg-amber-500 text-black transition-all',
  tabInactive:
    'flex-1 py-3 text-xs font-black tracking-widest uppercase bg-transparent text-slate-500 hover:text-slate-300 transition-all',
  form: 'flex flex-col gap-4',
  bottomRow: 'flex flex-col items-center gap-2',
  linkBtn:
    'text-slate-600 text-xs hover:text-slate-400 transition-colors tracking-widest uppercase font-bold'
};
