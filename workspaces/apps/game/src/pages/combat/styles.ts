export default {
    container: "w-screen h-screen relative overflow-hidden flex flex-col text-slate-200 bg-[#1a1a2e] selection:bg-violet-500/30",

    // Bandeau haut : compteur de tour · statut
    topBar: "flex-none flex items-center gap-6 px-8 py-4",
    pauseZone: "flex-none flex items-center gap-3 text-slate-300 font-bold tracking-wide",

    body: "flex-1 min-h-0 flex items-stretch gap-6 px-8 pb-8",

    feedScroll: "flex-1 min-h-0",

    // Scène plutôt à gauche mais légèrement décalée vers le centre (pl-16)
    stageColumn: "flex-1 min-w-0 flex items-center justify-start pl-16",
    stageWrapper: "relative shrink-0 rounded-xl overflow-hidden shadow-2xl ring-1 ring-slate-700/50",

    // Colonne droite : roster (ordre de passage) puis journal en dessous
    rightColumn: "flex-none w-72 flex flex-col gap-4 min-h-0",
    rosterPane: "flex-[0_0_auto] max-h-[50%] min-h-0",
}
