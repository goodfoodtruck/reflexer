export default {
    container: "w-screen h-screen relative overflow-hidden flex flex-col text-slate-200 bg-[#1a1a2e] selection:bg-violet-500/30",

    topBar: "flex-none flex items-center justify-between px-8 py-4",
    pauseZone: "flex items-center gap-3 text-slate-300 font-bold tracking-wide",

    body: "flex-1 min-h-0 flex items-stretch gap-6 px-8 pb-8",

    leftColumn: "flex-none w-44 flex flex-col gap-3 min-h-0",
    panelTitle: "text-center text-violet-300/70 text-xs font-bold tracking-[0.3em] uppercase",
    turnOrderScroll: "flex-1 min-h-0 overflow-y-auto",

    stageColumn: "flex-1 min-w-0 flex items-center justify-center",
    stageWrapper: "relative shrink-0 rounded-xl overflow-hidden shadow-2xl ring-1 ring-slate-700/50",

    rightColumn: "flex-none w-80 flex flex-col gap-3 min-h-0",
}