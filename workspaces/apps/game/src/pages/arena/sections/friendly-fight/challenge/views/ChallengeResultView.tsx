interface Props {
    won: boolean
    opponentName: string
    onClose: () => void
}

export function ChallengeResultView({
    won,
    opponentName,
    onClose
}: Props) {
    return (
        <div className="flex flex-col items-center gap-5 py-4">
            <div
                className={`w-full rounded-xl p-6 flex flex-col items-center gap-3 border ${
                    won
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-rose-500/10 border-rose-500/30"
                }`}
            >
                <span className="text-3xl">
                    {won ? "⚔️" : "💀"}
                </span>

                <p
                    className={`text-2xl font-black tracking-widest uppercase ${
                        won ? "text-emerald-400" : "text-rose-400"
                    }`}
                >
                    {won ? "Victoire" : "Défaite"}
                </p>

                <p className="text-slate-400 text-sm text-center">
                    {won
                        ? `Tu as battu ${opponentName} !`
                        : `${opponentName} t'a battu.`
                    }
                </p>
            </div>

            <button
                onClick={onClose}
                className="px-8 py-3 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white font-black tracking-widest uppercase text-xs rounded-xl transition-all"
            >
                Fermer
            </button>
        </div>
    )
}