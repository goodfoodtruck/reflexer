import { useLayoutEffect, useRef } from "react"
import type { CombatLogLine } from "../../../features/fight/replay/combat-view.types"
import { LogLineText } from "./LogLineText"

/** En deçà de ce seuil (px) on considère que l'utilisateur est « en haut ». */
const TOP_THRESHOLD = 4

/** Journal de combat scrollable : action la plus récente en haut, surlignée. */
export function CombatLog({ logs }: { logs: CombatLogLine[] }) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const prevHeightRef = useRef(0)

    useLayoutEffect(() => {
        const el = scrollRef.current
        if (!el) return
        // À ce stade le DOM est à jour mais `scrollTop` n'a pas bougé (les
        // nouvelles lignes sont insérées en haut). On décide donc à partir de
        // la position actuelle, avant ajustement.
        if (el.scrollTop <= TOP_THRESHOLD) {
            // L'utilisateur est en haut : on suit la nouvelle entrée.
            el.scrollTop = 0
        } else {
            // Il lit plus bas : on compense la hauteur ajoutée en haut pour
            // verrouiller sa position visuelle (pas de saut).
            el.scrollTop += el.scrollHeight - prevHeightRef.current
        }
        prevHeightRef.current = el.scrollHeight
    }, [logs.length])

    // Ordre inverse : la dernière entrée en premier.
    const ordered = [...logs].reverse()

    return (
        <div className="h-full flex flex-col rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-700/50 shadow-2xl overflow-hidden">
            <div className="flex-none flex items-center justify-between gap-2 px-3 pt-3 pb-2">
                <span className="text-amber-500/80 text-xs font-bold tracking-[0.2em] uppercase">Journal</span>
                <span className="flex items-center gap-1 text-[10px] text-slate-500 normal-case tracking-normal">
                    plus récent
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                        <path d="M12 19V5M6 11l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
            </div>
            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">
                <div className="flex flex-col gap-1.5">
                    {ordered.map((line, index) => {
                        const isLatest = index === 0
                        return (
                            <div
                                key={line.id}
                                className={`animate-log-enter px-2 py-1.5 rounded-lg border transition-opacity ${
                                    isLatest
                                        ? "bg-amber-950/40 border-amber-500/40"
                                        : "bg-slate-800/40 border-slate-700/30 opacity-70"
                                }`}
                            >
                                <LogLineText line={line} />
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
