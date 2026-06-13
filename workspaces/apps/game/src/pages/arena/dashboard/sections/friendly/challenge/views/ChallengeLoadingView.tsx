export function ChallengeLoadingView() {
    return (
        <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />

            <p className="text-xs font-black tracking-widest uppercase text-slate-400">
                Chargement du combat...
            </p>
        </div>
    )
}