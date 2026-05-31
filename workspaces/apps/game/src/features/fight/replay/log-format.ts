import type { ActionLog, EntitySnapshot, PlayingEntityID } from "@reflexer/engine"
import type { CombatLogLine } from "./combat-view.types"

/**
 * Construit la table des libellés affichables des entités à partir de l'état
 * initial : les alliés deviennent "Héros N", les ennemis "Monstre N" (index
 * 1-based par équipe, dans l'ordre de l'état initial).
 */
export function buildEntityLabels(entities: EntitySnapshot[]): Map<PlayingEntityID, string> {
    const labels = new Map<PlayingEntityID, string>()
    const counters: Record<string, number> = { PLAYER: 0, ENEMY: 0 }

    for (const entity of entities) {
        const index = (counters[entity.teamId] = (counters[entity.teamId] ?? 0) + 1)
        const prefix = entity.teamId === "PLAYER" ? "Héros" : "Monstre"
        labels.set(entity.id, `${prefix} ${index}`)
    }

    return labels
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
    id: number
): CombatLogLine | null {
    const labelOf = (entityId: PlayingEntityID) => labels.get(entityId) ?? entityId

    switch (log.type) {
        case "damage_dealt":
            return {
                id,
                segments: [
                    { kind: "actor", text: labelOf(log.sourceId) },
                    { kind: "plain", text: " lance " },
                    { kind: "skill", text: actionLabel(log.actionId) },
                    { kind: "plain", text: " sur " },
                    { kind: "target", text: labelOf(log.targetId) },
                ],
            }

        case "passive_applied":
            return {
                id,
                segments: [
                    { kind: "actor", text: labelOf(log.sourceId) },
                    { kind: "plain", text: " applique " },
                    { kind: "skill", text: actionLabel(log.passiveId) },
                    { kind: "plain", text: " sur " },
                    { kind: "target", text: labelOf(log.targetId) },
                ],
            }

        case "entity_died":
            return {
                id,
                segments: [
                    { kind: "target", text: labelOf(log.entityId) },
                    { kind: "plain", text: " est vaincu" },
                ],
            }

        case "entity_moved":
        case "damage_skipped":
        case "action_failed":
            return null
    }
}
