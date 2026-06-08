import type { CombatLogLine, LogSegment, LogSegmentKind } from "../../../features/fight/replay/combat-view.types"
import { SpriteFrame } from "./SpriteFrame"

const TEXT_STYLE: Record<LogSegmentKind, string> = {
    actor: "text-violet-300 font-semibold",
    skill: "text-cyan-300 font-semibold",
    target: "text-fuchsia-300 font-semibold",
    plain: "text-slate-500",
}

/** Icône générique quand l'action n'a pas d'image dédiée. */
function DefaultActionIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-cyan-300/80" fill="currentColor" aria-hidden>
            <path d="M12 2l2.4 6.9L21 12l-6.6 3.1L12 22l-2.4-6.9L3 12l6.6-3.1z" />
        </svg>
    )
}

function Segment({ segment }: { segment: LogSegment }) {
    // Portrait d'entité (acteur / cible)
    if (segment.sprite) {
        return (
            <span
                className="inline-flex h-7 w-7 items-center justify-center rounded bg-slate-950/40 ring-1 ring-slate-700/50 align-middle"
                title={segment.text}
            >
                <SpriteFrame icon={segment.sprite} className="h-6" />
            </span>
        )
    }

    // Action : image dédiée, sinon icône par défaut
    if (segment.kind === "skill") {
        return (
            <span
                className="inline-flex h-6 w-6 items-center justify-center rounded bg-slate-950/40 ring-1 ring-slate-700/50 align-middle"
                title={segment.text}
            >
                {segment.iconUrl
                    ? <img src={segment.iconUrl} alt={segment.text} className="h-5 w-5 object-contain" draggable={false} />
                    : <DefaultActionIcon />}
            </span>
        )
    }

    // Texte (connecteurs, ou repli si pas de visuel)
    return <span className={`${TEXT_STYLE[segment.kind]} text-xs`}>{segment.text}</span>
}

/** Rend une ligne de journal : portraits, icône d'action et connecteurs textuels. */
export function LogLineText({ line }: { line: CombatLogLine }) {
    return (
        <span className="inline-flex flex-wrap items-center gap-1 align-middle">
            {line.segments.map((segment, i) => (
                <Segment key={i} segment={segment} />
            ))}
        </span>
    )
}
