type Props = {
    turnIndex: number;
    status?: string;
};

/** Bandeau de tour : numéro de tour mis en avant + pastille de statut. */
export function TurnCounter({ turnIndex, status }: Props) {
    const ended = status === "ended";

    return (
        <div className="flex items-center gap-4 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-700/50 shadow-2xl px-5 py-3">
            <div className="flex items-baseline gap-2">
                <span className="text-amber-500/80 text-[10px] font-bold tracking-[0.3em] uppercase">Tour</span>
                <span className="text-3xl font-black text-white tabular-nums leading-none drop-shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                    {turnIndex + 1}
                </span>
            </div>

            <span className="h-7 w-px bg-slate-700/60" />

            <div className="flex items-center gap-2">
                <span
                    className={`w-2 h-2 rounded-full ${
                        ended ? "bg-rose-400" : "bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]"
                    }`}
                />
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-300">
                    {ended ? "Terminé" : "En cours"}
                </span>
            </div>
        </div>
    );
}
