export default {
    container: "w-screen h-screen font-sans relative overflow-hidden flex flex-col selection:bg-amber-500/30 bg-black",
    bgContainer: "absolute inset-0 z-0",
    bgImage: "w-full h-full object-cover opacity-60",
    overlay: "absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/10 to-slate-950/90 z-0 pointer-events-none",

    foreground: "relative z-10 flex flex-col h-full",
    titleWrapper: "pt-24 text-center",
    mainTitle: "text-8xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]",
    subtitle: "text-amber-500/70 tracking-[0.7em] text-sm mt-6 uppercase font-bold drop-shadow-md",

    heroCenterPosition: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    heroGroup: "w-[1500px] h-[1500px] relative group flex items-center justify-center",
    heroGlow: "absolute inset-20 bg-amber-800/10 rounded-full blur-3xl opacity-70",
    heroImageWrapper: "relative w-full h-full overflow-hidden flex items-center justify-center",
    heroImage: "max-w-full max-h-full object-contain opacity-95 group-hover:scale-105 transition-transform duration-700 ease-out",

    navContainer: "absolute bottom-32 left-20 flex flex-col gap-6"
};