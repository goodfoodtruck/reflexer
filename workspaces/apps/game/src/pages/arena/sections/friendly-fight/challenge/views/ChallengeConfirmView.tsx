interface Props {
    opponentName: string
    onChallenge: () => void
    onClose: () => void
}

export function ChallengeConfirmView({
    opponentName,
    onChallenge,
    onClose
}: Props) {
    return (
        <>
            <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black tracking-[0.3em] uppercase text-amber-500">
                    Combat amical
                </p>

                <p className="text-2xl font-black tracking-widest uppercase text-white">
                    {opponentName}
                </p>
            </div>

            <div className="border-t border-slate-700/30 my-4" />

            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white font-black tracking-widest uppercase text-xs rounded-xl transition-all"
                >
                    Annuler
                </button>

                <button
                    onClick={onChallenge}
                    className="flex-1 py-3 bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black tracking-widest uppercase text-xs rounded-xl transition-all"
                >
                    Lancer le combat
                </button>
            </div>
        </>
    )
}