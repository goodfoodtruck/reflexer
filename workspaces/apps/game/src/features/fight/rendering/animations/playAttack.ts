import type { Container } from "pixi.js"
import type { TweenFn } from "./tween"

export async function playAttack(tween: TweenFn, target: Container): Promise<void> {
    const originX = target.x
    target.tint = 0xff4444
    await tween(250, t => {
        target.x = originX + Math.sin(t * Math.PI * 4) * 8
    })
    target.x = originX
    target.tint = 0xffffff
}
