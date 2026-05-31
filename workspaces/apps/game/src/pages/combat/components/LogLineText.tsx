import type { CombatLogLine, LogSegmentKind } from "../../../features/fight/replay/combat-view.types"

const SEGMENT_STYLE: Record<LogSegmentKind, string> = {
    actor: "text-violet-300 font-semibold",
    skill: "text-cyan-300 font-semibold",
    target: "text-fuchsia-300 font-semibold",
    plain: "text-slate-400",
}

/** Rend une ligne de journal avec ses segments colorés (acteur / compétence / cible). */
export function LogLineText({ line }: { line: CombatLogLine }) {
    return (
        <span>
            {line.segments.map((segment, i) => (
                <span key={i} className={SEGMENT_STYLE[segment.kind]}>
                    {segment.text}
                </span>
            ))}
        </span>
    )
}
