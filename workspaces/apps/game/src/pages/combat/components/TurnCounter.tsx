export function TurnCounter({ turnIndex }: { turnIndex: number }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <span className="text-violet-300/70 text-xs font-bold tracking-[0.3em] uppercase">Tour</span>
            <span className="text-2xl font-black text-slate-100 tabular-nums">{turnIndex + 1}</span>
        </div>
    )
}