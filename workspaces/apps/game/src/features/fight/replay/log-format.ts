import type { ActionLog, PlayingEntityID } from "@reflexer/engine"
import type { CombatLogLine, LogActor, LogSkill, SpriteIcon } from "./combat-view.types"

/** Sources visuelles à injecter dans les lignes de journal. */
export type LogVisuals = {
    /** Portrait de chaque entité (acteur / cible). */
    icons: Map<PlayingEntityID, SpriteIcon>
    /** Image d'une action/passif, ou `null` pour l'icône par défaut. */
    actionIcon: (actionId: string) => string | null
    /** Libellé d'une action porté par la donnée, ou `null` pour le repli humanisé. */
    actionName: (actionId: string) => string | null
}

const ACTION_LABELS: Record<string, string> = {
    attack: "Attaque",
}

export function actionLabel(actionId: string): string {
    return ACTION_LABELS[actionId] ?? humanize(actionId)
}

function humanize(id: string): string {
    const text = id.replace(/[_-]+/g, " ").trim()
    return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Transforme un log d'action en ligne de journal affichable (segments colorés).
 * Renvoie `null` pour les logs non narratifs (déplacement, dégâts ignorés, échec).
 */
export function formatActionLog(
    log: ActionLog,
    labels: Map<PlayingEntityID, string>,
    visuals: LogVisuals,
    id: number
): CombatLogLine | null {
    const labelOf = (entityId: PlayingEntityID) => labels.get(entityId) ?? entityId
    const entity = (entityId: PlayingEntityID): LogActor =>
        ({ label: labelOf(entityId), sprite: visuals.icons.get(entityId) })
    const skill = (actionId: string): LogSkill =>
        ({ label: visuals.actionName(actionId) ?? actionLabel(actionId), iconUrl: visuals.actionIcon(actionId) ?? undefined })

    switch (log.type) {
        case "damage_dealt": {
            const damage = { kind: "damage" as const, text: `−${Math.round(log.amount)} PV` }
            // Dégât sur soi (DoT type saignement, source === cible) : pas de
            // lanceur tiers, la victime « subit » l'effet.
            if (log.sourceId === log.targetId) {
                return { id, actor: entity(log.targetId), verb: "subit", skill: skill(log.actionId), target: null, amount: damage }
            }
            return {
                id,
                actor: entity(log.sourceId),
                verb: "lance",
                skill: skill(log.actionId),
                target: entity(log.targetId),
                amount: damage,
            }
        }

        case "heal_dealt":
            return {
                id,
                actor: entity(log.sourceId),
                verb: "soigne",
                skill: null,
                target: entity(log.targetId),
                amount: { kind: "heal", text: `+${Math.round(log.amount)} PV` },
            }

        case "passive_applied":
            return {
                id,
                actor: entity(log.sourceId),
                verb: "applique",
                skill: skill(log.passiveId),
                target: entity(log.targetId),
                amount: null,
            }

        case "entity_died":
            return {
                id,
                actor: entity(log.entityId),
                verb: "est vaincu",
                skill: null,
                target: null,
                amount: null,
            }

        case "entity_moved":
        case "damage_skipped":
        case "action_failed":
        case "updated_energy":
        case "heal_skipped":
            return null
    }
}
