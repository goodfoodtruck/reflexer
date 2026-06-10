interface Props {
    message: string
    onRetry: () => void
    onClose: () => void
}

export function ChallengeErrorView({
    message,
    onRetry,
    onClose
}: Props) {
    return (
        <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-full bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                <p className="text-rose-400 text-xs font-bold text-center">
                    {message}
                </p>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    className="px-6 py-3 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white font-black tracking-widest uppercase text-xs rounded-xl transition-all"
                >
                    Fermer
                </button>

                <button
                    onClick={onRetry}
                    className="px-6 py-3 bg-transparent border border-amber-500/40 hover:border-amber-500 text-amber-400 font-black tracking-widest uppercase text-xs rounded-xl transition-all"
                >
                    Réessayer
                </button>
            </div>
        </div>
    )
}