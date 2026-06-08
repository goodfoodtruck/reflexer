import type { ActionLog, PlayingEntityID } from "@reflexer/engine"
import type { CombatLogLine, SpriteIcon } from "./combat-view.types"

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
    const actor = (entityId: PlayingEntityID) =>
        ({ kind: "actor" as const, text: labelOf(entityId), sprite: visuals.icons.get(entityId) })
    const target = (entityId: PlayingEntityID) =>
        ({ kind: "target" as const, text: labelOf(entityId), sprite: visuals.icons.get(entityId) })
    const skill = (actionId: string) =>
        ({ kind: "skill" as const, text: visuals.actionName(actionId) ?? actionLabel(actionId), iconUrl: visuals.actionIcon(actionId) ?? undefined })

    switch (log.type) {
        case "damage_dealt":
            return {
                id,
                segments: [
                    actor(log.sourceId),
                    { kind: "plain", text: " lance " },
                    skill(log.actionId),
                    { kind: "plain", text: " sur " },
                    target(log.targetId),
                ],
            }

        case "passive_applied":
            return {
                id,
                segments: [
                    actor(log.sourceId),
                    { kind: "plain", text: " applique " },
                    skill(log.passiveId),
                    { kind: "plain", text: " sur " },
                    target(log.targetId),
                ],
            }

        case "entity_died":
            return {
                id,
                segments: [
                    target(log.entityId),
                    { kind: "plain", text: " est vaincu" },
                ],
            }

        case "entity_moved":
        case "damage_skipped":
        case "action_failed":
        case "updated_energy":
        case "heal_dealt":
        case "heal_skipped":
            return null
    }
}
