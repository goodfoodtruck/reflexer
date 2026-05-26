import type { AnimationCommand } from "./replay.types"
import { CombatScene } from "../rendering/CombatScene"
import { playMove } from "../rendering/animations/playMove"
import { playAttack } from "../rendering/animations/playAttack"
import { playDeath } from "../rendering/animations/playDeath"

export class AnimationQueue {
    constructor(private readonly scene: CombatScene) {}

    async run(command: AnimationCommand): Promise<void> {
        switch (command.kind) {

            case "move":
                await playMove(this.scene, command.entityId, command.to)
                break

            case "attack":
                await playAttack(this.scene, command.sourceId, command.targetId, {
                    amount: command.amount,
                    reactionDepth: command.reactionDepth
                })
                break

            case "death":
                await playDeath(this.scene, command.entityId)
                break
        }
    }
}