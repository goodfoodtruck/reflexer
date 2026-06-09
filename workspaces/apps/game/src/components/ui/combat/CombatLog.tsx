import { useEffect, useRef } from "react"
import type { CombatLogLine } from "../../../features/fight/replay/combat-view.types"
import { LogLineText } from "./LogLineText"

/** Journal de combat scrollable, qui s'auto-défile vers la dernière entrée. */
export function CombatLog({ logs }: { logs: CombatLogLine[] }) {
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // On défile le conteneur lui-même (et non `scrollIntoView`, qui ferait
        // remonter toute la page) pour garder l'overflow confiné ici.
        const el = scrollRef.current
        if (el) el.scrollTop = el.scrollHeight
    }, [logs.length])

    return (
        <div className="h-full flex flex-col rounded-xl bg-slate-900/40 border border-slate-700/40 overflow-hidden">
            <div className="flex-none flex items-center justify-between gap-2 px-3 pt-3 pb-2">
                <span className="text-violet-300/70 text-xs font-bold tracking-[0.2em] uppercase">Journal</span>
                <span className="flex items-center gap-1 text-[10px] text-slate-500 normal-case tracking-normal">
                    plus récent
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                        <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
            </div>
            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">
                <div className="flex flex-col gap-1.5">
                    {logs.map(line => (
                        <div
                            key={line.id}
                            className="px-2 py-1.5 rounded-lg bg-slate-800/40 border border-slate-700/30"
                        >
                            <LogLineText line={line} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
