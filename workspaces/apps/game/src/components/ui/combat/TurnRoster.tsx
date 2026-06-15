import type { PlayingEntityID, PlayingTeamID } from "@reflexer/engine"
import type { EntityView } from "@features/fight/replay/combat-view.types.ts"
import { SpriteFrame } from "./SpriteFrame"

const TEAM_TONE: Record<PlayingTeamID, { dot: string; idle: string; active: string }> = {
    PLAYER: {
        dot: "bg-sky-400",
        idle: "bg-sky-950/25 border-sky-800/40",
        active: "bg-sky-950/55 border-sky-400/70 ring-1 ring-sky-400/40",
    },
    ENEMY: {
        dot: "bg-rose-400",
        idle: "bg-rose-950/25 border-rose-800/40",
        active: "bg-rose-950/55 border-rose-400/70 ring-1 ring-rose-400/40",
    },
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
    const ratio = max > 0 ? value / max : 0
    return (
        <div className="h-1.5 rounded-full bg-slate-950/60 overflow-hidden">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.round(ratio * 100)}%` }} />
        </div>
    )
}

function Badge({ label, tone }: { label: string; tone: string }) {
    return (
        <span className={`flex-none text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${tone}`}>
            {label}
        </span>
    )
}

type Props = {
    /** Personnages triés par ordre de passage (le prochain à jouer en haut). */
    members: EntityView[]
    activeId: PlayingEntityID | null
    nextId: PlayingEntityID | null
}

/** Liste unifiée des personnages (ordre de passage), couleur par équipe, badges Joue / Suivant. */
export function TurnRoster({ members, activeId, nextId }: Props) {
    return (
        <div className="h-full flex flex-col gap-2 min-h-0">
            <div className="flex items-center gap-2 section-label text-slate-400">
                Combattants
                <span className="ml-auto flex items-center gap-1 text-[9px] tracking-normal normal-case text-slate-500">
                    <span className="w-2 h-2 rounded-sm bg-sky-400" /> alliés
                    <span className="w-2 h-2 rounded-sm bg-rose-400 ml-1" /> ennemis
                </span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 pr-1">
                {members.map(member => {
                    const tone = TEAM_TONE[member.teamId]
                    const isActive = member.id === activeId
                    const isNext = member.id === nextId
                    return (
                        <div
                            key={member.id}
                            className={`rounded-lg border p-2 flex items-center gap-2 transition-opacity ${
                                isActive ? tone.active : tone.idle
                            } ${member.alive ? "" : "opacity-40 grayscale"}`}
                        >
                            <span className={`flex-none w-9 h-9 flex items-center justify-center rounded bg-slate-950/40 ring-1 ${
                                isActive ? "ring-slate-300/40" : "ring-slate-700/40"
                            }`}>
                                {member.icon
                                    ? <SpriteFrame icon={member.icon} className="h-8" />
                                    : <span className={`w-2.5 h-2.5 rounded-sm ${tone.dot}`} />}
                            </span>

                            <div className="flex-1 min-w-0 flex flex-col gap-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-100 truncate">{member.label}</span>
                                    {isActive && <Badge label="Joue" tone="bg-slate-200/90 text-slate-900" />}
                                    {!isActive && isNext && <Badge label="Suivant" tone="bg-slate-700/70 text-slate-200" />}
                                </div>
                                <MiniBar value={member.hp} max={member.maxHp} color="bg-emerald-400" />
                                <MiniBar value={member.energy} max={member.maxEnergy} color="bg-amber-400" />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
