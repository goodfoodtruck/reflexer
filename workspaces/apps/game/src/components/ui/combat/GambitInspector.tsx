import type { Gambit } from "@reflexer/engine"
import type { CombatLogLine } from "../../../features/fight/replay/combat-view.types"

// Le moteur expose les conditions/cibles sous une forme typée ; on en fait ici
// une lecture « best effort » pour l'affichage (les champs sont des chaînes).
type AnyNode = {
    operator?: "AND" | "OR" | "NOT"
    conditions?: AnyNode[]
    condition?: AnyNode
    type?: string
    context?: { targetType?: string; filters?: AnyFilter[] }
    threshold?: number
}
type AnyFilter = { type: string; threshold?: number; range?: number; passiveId?: string }

const TARGET_LABELS: Record<string, string> = {
    SELF: "Soi",
    ALLY: "Allié",
    ENEMY: "Ennemi",
}

const SORT_LABELS: Record<string, string> = {
    LOWEST_HP: "PV les plus bas",
    HIGHEST_HP: "PV les plus hauts",
    NEAREST: "le plus proche",
    FURTHEST: "le plus éloigné",
    NEAREST_FROM_ALLY: "le plus proche d'un allié",
    NEAREST_FROM_ENEMY: "le plus proche d'un ennemi",
    FURTHEST_FROM_ALLY: "le plus éloigné d'un allié",
    FURTHEST_FROM_ENEMY: "le plus éloigné d'un ennemi",
}

const STRATEGY_LABELS: Record<string, string> = {
    APPROACH: "se rapprocher",
    FLEE: "fuir",
    STAY: "rester sur place",
}

function filterText(filter: AnyFilter): string {
    switch (filter.type) {
        case "HP_BELOW": return `PV < ${filter.threshold}%`
        case "HP_ABOVE": return `PV > ${filter.threshold}%`
        case "HAS_PASSIVE": return `a le statut ${filter.passiveId}`
        case "IN_RANGE": return `à portée ${filter.range}`
        case "ALLY_IN_RANGE_OF_ENEMY": return `à portée ${filter.range} d'un ennemi`
        case "ALLY_IN_RANGE_OF_ALLY": return `à portée ${filter.range} d'un allié`
        case "ENEMY_IN_RANGE_OF_ALLY": return `à portée ${filter.range} d'un allié`
        case "IS_ATTACKING_ALLY": return "attaque un allié"
        case "IS_ATTACKING_SELF": return "attaque soi-même"
        default: return filter.type
    }
}

const TONE_BY_TARGET: Record<string, string> = {
    SELF: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    ALLY: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    ENEMY: "bg-rose-500/15 text-rose-300 border-rose-500/30",
}

/** Une feuille EXISTS : pastille de cible + filtres lisibles. */
function ConditionLeaf({ node }: { node: AnyNode }) {
    const targetType = node.context?.targetType ?? "?"
    const filters = node.context?.filters ?? []
    const tone = TONE_BY_TARGET[targetType] ?? "bg-slate-700/40 text-slate-300 border-slate-600/40"
    return (
        <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${tone}`}>
                {TARGET_LABELS[targetType] ?? targetType}
            </span>
            {filters.length === 0
                ? <span className="text-xs text-slate-400">existe</span>
                : filters.map((f, i) => (
                    <span key={i} className="text-xs text-slate-300">{filterText(f)}</span>
                ))}
        </div>
    )
}

/** Rend récursivement l'arbre de conditions du gambit. */
function ConditionNode({ node }: { node: AnyNode }) {
    if (node.operator === "NOT" && node.condition) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">Non</span>
                <ConditionNode node={node.condition} />
            </div>
        )
    }

    if ((node.operator === "AND" || node.operator === "OR") && node.conditions) {
        const joinLabel = node.operator === "AND" ? "ET" : "OU"
        return (
            <div className="flex flex-col gap-1.5">
                {node.conditions.map((child, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                        {i > 0 && <span className="text-[10px] font-black uppercase tracking-wider text-amber-500/70">{joinLabel}</span>}
                        <ConditionNode node={child} />
                    </div>
                ))}
            </div>
        )
    }

    return <ConditionLeaf node={node} />
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</span>
            {children}
        </div>
    )
}

function GambitDetail({ gambit }: { gambit: Gambit }) {
    const conditions = gambit.conditions as unknown as AnyNode
    const target = gambit.targetSelector as unknown as { context: { targetType?: string }; sort: string }
    const intent = gambit.intent

    const targetType = target.context?.targetType ?? "?"

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <span className="flex-none w-7 h-7 rounded bg-slate-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs">
                    {String(gambit.priority).padStart(2, "0")}
                </span>
                <span className="text-sm font-bold text-slate-100 truncate capitalize">
                    {gambit.name}
                </span>
            </div>

            <Section label="Quand">
                <ConditionNode node={conditions} />
            </Section>

            <Section label="Cibler">
                <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${TONE_BY_TARGET[targetType] ?? "bg-slate-700/40 text-slate-300 border-slate-600/40"}`}>
                        {TARGET_LABELS[targetType] ?? targetType}
                    </span>
                    <span className="text-xs text-slate-400">→</span>
                    <span className="text-xs font-bold text-amber-300">{SORT_LABELS[target.sort] ?? target.sort}</span>
                </div>
            </Section>

            <Section label="Faire">
                <span className="text-xs font-bold text-slate-200">
                    {intent.kind === "MOVEMENT"
                        ? `Déplacement — ${STRATEGY_LABELS[intent.strategy] ?? intent.strategy}`
                        : `Action — ${intent.actionId}`}
                </span>
            </Section>
        </div>
    )
}

type Props = {
    line: CombatLogLine
    onClose: () => void
}

/** Fenêtre de détail : le gambit déclencheur et l'action jouée pour un log. */
export function GambitInspector({ line, onClose }: Props) {
    return (
        <div className="h-full flex flex-col rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-700/50 shadow-2xl overflow-hidden">
            <div className="flex-none flex items-center justify-between gap-2 px-4 pt-3 pb-2 border-b border-slate-700/40">
                <span className="text-amber-500/80 text-xs font-bold tracking-[0.2em] uppercase">Détail</span>
                <button
                    onClick={onClose}
                    aria-label="Fermer"
                    className="flex-none w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
                >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-5">
                {/* Action jouée */}
                <Section label="Action">
                    <div className="flex items-center gap-2.5 rounded-lg bg-slate-950/40 border border-slate-700/40 p-2.5">
                        {line.skill?.iconUrl
                            ? <img src={line.skill.iconUrl} alt="" className="w-9 h-9 rounded object-contain" />
                            : <span className="w-9 h-9 rounded bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">⚔</span>}
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-slate-100 truncate">{line.skill?.label ?? line.verb}</span>
                            {line.target && (
                                <span className="text-xs text-slate-400 truncate">
                                    {line.actor?.label} → {line.target.label}
                                </span>
                            )}
                            {line.amount && (
                                <span className={`text-xs font-bold ${line.amount.kind === "heal" ? "text-emerald-400" : "text-rose-400"}`}>
                                    {line.amount.text}
                                </span>
                            )}
                        </div>
                    </div>
                </Section>

                {/* Gambit déclencheur */}
                <Section label="Gambit déclencheur">
                    {line.gambit
                        ? <GambitDetail gambit={line.gambit} />
                        : <span className="text-xs text-slate-500 italic">Effet automatique — aucun gambit associé.</span>}
                </Section>
            </div>
        </div>
    )
}
