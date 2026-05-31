import type { PlayingEntityID } from "@reflexer/engine"
import type { EntityView } from "../../../features/fight/replay/combat-view.types"

type Props = {
    owners: PlayingEntityID[]
    entities: Record<PlayingEntityID, EntityView>
    max?: number
}

/** Liste des prochaines entités à jouer (ordre d'initiative à venir). */
export function TurnOrderList({ owners, entities, max = 5 }: Props) {
    const upcoming = owners.slice(0, max)

    return (
        <div className="w-full flex flex-col gap-2">
            {upcoming.length === 0 && (
                <span className="text-center text-slate-600 text-xs italic">—</span>
            )}
            {upcoming.map((id, i) => {
                const entity = entities[id]
                if (!entity) return null
                return (
                    <div
                        key={`${id}-${i}`}
                        className="flex items-center gap-2 rounded-lg bg-slate-900/40 border border-slate-700/40 px-2 py-1.5"
                    >
                        <span className="text-slate-500 text-xs font-bold tabular-nums w-4 text-right">
                            {i + 1}
                        </span>
                        <span
                            className={`w-3 h-3 rounded-sm ${
                                entity.teamId === "PLAYER" ? "bg-sky-400" : "bg-rose-400"
                            }`}
                        />
                        <span className="text-xs text-slate-300 truncate">{entity.label}</span>
                    </div>
                )
            })}
        </div>
    )
}
