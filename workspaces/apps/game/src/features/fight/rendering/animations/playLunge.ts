import type { Container } from "pixi.js"
import type { TweenFn } from "./tween"

/** Coup porté générique (petit bond vers l'avant) quand l'attaquant n'a pas de clip `attack`. */
export async function playLunge(tween: TweenFn, sprite: Container, facing: 1 | -1): Promise<void> {
    const originX = sprite.x
    await tween(220, t => {
        const reach = Math.sin(t * Math.PI) // 0 → 1 → 0
        sprite.x = originX + facing * 12 * reach
    })
    sprite.x = originX
}
