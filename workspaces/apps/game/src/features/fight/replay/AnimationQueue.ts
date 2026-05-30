import type { AnimationCommand } from "./replay.types"
import type { TweenFn } from "../rendering/animations/tween"
import { makeTween } from "../rendering/animations/tween"
import { CombatScene } from "../rendering/CombatScene"
import { playAttack } from "../rendering/animations/playAttack"
import { playMove } from "../rendering/animations/playMove"
import { playDeath } from "../rendering/animations/playDeath"
import { playPassive } from "../rendering/animations/playPassive"

export class AnimationQueue {
    private readonly tween: TweenFn

    constructor(private readonly scene: CombatScene) {
        this.tween = makeTween(scene.ticker)
    }

    async run(command: AnimationCommand): Promise<void> {
        switch (command.kind) {
            case "attack": {
                const target = this.scene.getSprite(command.targetId)
                if (target) await playAttack(this.tween, target)
                break
            }
            case "move": {
                const sprite = this.scene.getSprite(command.entityId)
                if (sprite) await playMove(this.tween, sprite, this.scene.cellToPixel(command.to))
                break
            }
            case "death": {
                const sprite = this.scene.getSprite(command.entityId)
                if (sprite) await playDeath(this.tween, sprite)
                break
            }
            case "passive": {
                const sprite = this.scene.getSprite(command.targetId)
                if (sprite) await playPassive(this.tween, sprite)
                break
            }
        }
    }
}