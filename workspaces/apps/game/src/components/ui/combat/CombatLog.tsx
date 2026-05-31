import { useEffect, useRef } from "react"
import type { CombatLogLine } from "../../../features/fight/replay/combat-view.types"
import { LogLineText } from "./LogLineText"

/** Journal de combat scrollable, qui s'auto-défile vers la dernière entrée. */
export function CombatLog({ logs }: { logs: CombatLogLine[] }) {
    const endRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    }, [logs.length])

    return (
        <div className="flex-1 rounded-xl bg-slate-900/40 border border-slate-700/40 p-3 overflow-y-auto min-h-0">
            <div className="text-center text-violet-300/70 text-xs font-bold tracking-[0.2em] uppercase mb-3">
                Journal de combat
            </div>
            <div className="flex flex-col gap-1.5">
                {logs.map(line => (
                    <div
                        key={line.id}
                        className="px-3 py-1.5 rounded-lg bg-slate-800/40 border border-slate-700/30 text-xs"
                    >
                        <LogLineText line={line} />
                    </div>
                ))}
                <div ref={endRef} />
            </div>
        </div>
    )
}
