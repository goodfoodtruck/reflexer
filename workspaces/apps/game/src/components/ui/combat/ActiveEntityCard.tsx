import type { EntityView } from "../../../features/fight/replay/combat-view.types"
import { SpriteFrame } from "./SpriteFrame"

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    const ratio = max > 0 ? value / max : 0
    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 w-4">{label}</span>
            <div className="flex-1 h-2 rounded-full bg-slate-950/60 overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.round(ratio * 100)}%` }} />
            </div>
            <span className="text-[10px] tabular-nums text-slate-300 w-12 text-right">
                {Math.round(value)}/{max}
            </span>
        </div>
    )
}

/** Carte de l'entité en train de jouer : libellé + barres de vie et d'énergie. */
export function ActiveEntityCard({ entity }: { entity: EntityView | undefined }) {
    if (!entity) return null

    return (
        <div className="w-full rounded-xl bg-violet-950/40 border border-violet-500/40 p-3 flex items-center gap-3 shadow-lg">
            <span className="flex-none w-12 h-12 flex items-center justify-center rounded-lg bg-slate-950/50 ring-1 ring-violet-500/40">
                {entity.icon
                    ? <SpriteFrame icon={entity.icon} className="h-11" />
                    : <span className={`w-3 h-3 rounded-sm ${entity.teamId === "PLAYER" ? "bg-sky-400" : "bg-rose-400"}`} />}
            </span>
            <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-100 truncate">{entity.label}</span>
                    <span className="ml-auto text-[10px] uppercase tracking-wider text-violet-300/70">Joue</span>
                </div>
                <StatBar label="PV" value={entity.hp} max={entity.maxHp} color="bg-emerald-400" />
                <StatBar label="E" value={entity.energy} max={entity.maxEnergy} color="bg-amber-400" />
            </div>
        </div>
    )
}
