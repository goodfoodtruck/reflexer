export default {
    // Même coquille que les autres pages : fond noir + accent ambre
    container: "w-screen h-screen relative overflow-hidden flex flex-col text-slate-200 bg-black selection:bg-amber-500/30",

    // Décor de bataille partagé (image + overlay + scanlines)
    bgContainer: "absolute inset-0 z-0 overflow-hidden",
    bgImage: "w-full h-full object-cover opacity-100 blur-[1px] animate-[ambient-zoom_10s_ease-in-out_infinite_alternate]",
    overlay: "absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950/70 to-slate-950/95 z-0 pointer-events-none",
    scanlines: "absolute inset-0 pointer-events-none z-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]",

    foreground: "relative z-10 flex flex-col h-full",

    // Bandeau haut : compteur de tour · statut
    topBar: "flex-none flex items-center px-8 pt-8 pb-2",

    // Carte + interface forment un bloc centré horizontalement
    body: "flex-1 min-h-0 flex items-stretch justify-center gap-6 px-8 pb-8",

    feedScroll: "flex-1 min-h-0",

    // Scène centrée verticalement dans le bloc
    stageColumn: "flex-none flex items-center",
    stageWrapper: "relative shrink-0 rounded-xl overflow-hidden shadow-2xl ring-1 ring-slate-700/50",

    // Colonne droite collée à la carte (le gap-6 du body fait l'espacement)
    rightColumn: "flex-none w-72 flex flex-col gap-4 min-h-0",
    // Panneau ambré cohérent avec les autres pages
    rosterPane: "flex-[0_0_auto] max-h-[50%] min-h-0 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl p-3",
}
