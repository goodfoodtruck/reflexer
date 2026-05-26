import type { ActionLog, IActionRegistry } from "@reflexer/engine"
import type { AnimationCommand } from "./replay.types.ts"
export class LogInterpreter {
    constructor(
        private readonly actionRegistry: IActionRegistry,
    ) {}

    interpret(log: ActionLog): AnimationCommand {
        switch (log.type) {
            case "damage_dealt": {
                const visual = this.actionRegistry.get(log.actionId)
                return {
                    kind: "attack",
                    sourceId: log.sourceId,
                    targetId: log.targetId,
                    amount: log.amount,
                    animationKey: visual.animationKey,
                    soundKey: visual.soundKey
                }
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
        }
    }
}