import type { ActionLog } from "@reflexer/engine"
import type { AnimationCommand } from "./replay.types.ts"

export class LogInterpreter {
    interpret(log: ActionLog): AnimationCommand | null {
        switch (log.type) {
            case "damage_dealt":
                return {
                    kind: "attack",
                    sourceId: log.sourceId,
                    targetId: log.targetId,
                    amount: log.amount,
                    animationKey: "visual.animationKey",
                    soundKey: "visual.soundKey"
                }

            case "entity_moved":
                return {
                    kind: "move",
                    entityId: log.entityId,
                    to: log.cell
                }

            case "entity_died":
                return {
                    kind: "death",
                    entityId: log.entityId
                }

            case "passive_applied":
                return {
                    kind: "passive",
                    targetId: log.targetId,
                    passiveId: log.passiveId
                }

            case "damage_skipped":
            case "action_failed":
                return null
        }
    }
}