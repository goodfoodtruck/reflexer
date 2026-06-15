import type { ActionLog } from "@reflexer/engine"
import { CombatScene } from "../rendering/CombatScene"

export class AnimationQueue {
    constructor(private readonly scene: CombatScene) {}

    async play(log: ActionLog): Promise<void> {
        switch (log.type) {
            case "damage_dealt":
                await this.scene.playAttack(log.sourceId, log.targetId)
                break
            case "entity_moved":
                await this.scene.playMove(log.entityId, log.cell)
                break
            case "entity_died":
                await this.scene.playDeath(log.entityId)
                break
            case "passive_applied":
                await this.scene.playPassive(log.targetId)
                break
            case "damage_skipped":
            case "action_failed":
                break
        }
    }
}
