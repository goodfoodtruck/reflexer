import type { CombatLogLine } from "../../../features/fight/replay/combat-view.types"
import { LogLineText } from "./LogLineText"

/** Bandeau central affichant l'action en cours de lecture. */
export function CurrentActionBanner({ action }: { action: CombatLogLine | null }) {
    return (
        <div className="px-5 py-2 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm min-w-64 text-center">
            {action ? <LogLineText line={action} /> : <span className="text-slate-500 italic">En attente du combat…</span>}
        </div>
    )
}
