import type { Container } from "pixi.js"
import type { TweenFn } from "./tween"
import { easeOutCubic } from "./tween"

export async function playMove(tween: TweenFn, sprite: Container, to: { x: number; y: number }): Promise<void> {
    const fromX = sprite.x
    const fromY = sprite.y
    await tween(300, t => {
        const ease = easeOutCubic(t)
        sprite.x = fromX + (to.x - fromX) * ease
        sprite.y = fromY + (to.y - fromY) * ease
    })
}
