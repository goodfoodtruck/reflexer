import type { Container } from "pixi.js"
import type { TweenFn } from "./tween"

export async function playDeath(tween: TweenFn, sprite: Container): Promise<void> {
    await tween(500, t => {
        sprite.alpha = 1 - t
        sprite.scale.set(1 - t * 0.3)
    })
    sprite.visible = false
}
