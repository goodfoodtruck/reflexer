import type { CombatLogLine, LogActor, LogSkill } from "../../../features/fight/replay/combat-view.types"
import { SpriteFrame } from "./SpriteFrame"

// Colonnes fixes partagées par toutes les lignes : acteur · verbe · compétence ·
// cible · montant. Les largeurs de tête sont figées pour que les colonnes
// s'alignent d'une ligne à l'autre (chaque ligne est sa propre grille).
const GRID_COLUMNS = "1.75rem 5rem 1.5rem 1.75rem auto"

/** Icône générique quand l'action n'a pas d'image dédiée. */
function DefaultActionIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-cyan-300/80" fill="currentColor" aria-hidden>
            <path d="M12 2l2.4 6.9L21 12l-6.6 3.1L12 22l-2.4-6.9L3 12l6.6-3.1z" />
        </svg>
    )
}

/** Portrait d'entité (acteur / cible), ou pastille si pas de sprite. */
function Portrait({ actor }: { actor: LogActor | null }) {
    if (!actor) return <span aria-hidden />
    return (
        <span
            className="inline-flex h-7 w-7 items-center justify-center rounded bg-slate-950/40 ring-1 ring-slate-700/50"
            title={actor.label}
        >
            {actor.sprite
                ? <SpriteFrame icon={actor.sprite} className="h-6" />
                : <span className="w-2.5 h-2.5 rounded-sm bg-slate-500" />}
        </span>
    )
}

/** Icône de compétence/action. */
function SkillIcon({ skill }: { skill: LogSkill | null }) {
    if (!skill) return <span aria-hidden />
    return (
        <span
            className="inline-flex h-6 w-6 items-center justify-center rounded bg-slate-950/40 ring-1 ring-slate-700/50"
            title={skill.label}
        >
            {skill.iconUrl
                ? <img src={skill.iconUrl} alt={skill.label} className="h-5 w-5 object-contain" draggable={false} />
                : <DefaultActionIcon />}
        </span>
    )
}

/** Rend une ligne de journal alignée en colonnes : acteur, verbe, compétence, cible, montant. */
export function LogLineText({ line }: { line: CombatLogLine }) {
    return (
        <div className="grid items-center gap-x-2" style={{ gridTemplateColumns: GRID_COLUMNS }}>
            <Portrait actor={line.actor} />
            <span className="text-xs text-slate-400 truncate" title={line.verb}>{line.verb}</span>
            <SkillIcon skill={line.skill} />
            <Portrait actor={line.target} />
            {line.amount
                ? (
                    <span
                        className={`text-xs font-bold tabular-nums ${
                            line.amount.kind === "damage" ? "text-rose-300" : "text-emerald-300"
                        }`}
                    >
                        {line.amount.text}
                    </span>
                )
                : <span aria-hidden />}
        </div>
    )
}
