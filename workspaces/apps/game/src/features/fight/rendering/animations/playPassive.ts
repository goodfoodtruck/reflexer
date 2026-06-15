import type { Container } from "pixi.js"
import type { TweenFn } from "./tween"

export async function playPassive(tween: TweenFn, sprite: Container): Promise<void> {
    await tween(400, t => {
        const intensity = Math.sin(t * Math.PI)
        sprite.tint = blendColor(0xffffff, 0xaaaaff, intensity)
    })
    sprite.tint = 0xffffff
}

function blendColor(from: number, to: number, t: number): number {
    const r = Math.round(((from >> 16) & 0xff) * (1 - t) + ((to >> 16) & 0xff) * t)
    const g = Math.round(((from >> 8) & 0xff) * (1 - t) + ((to >> 8) & 0xff) * t)
    const b = Math.round((from & 0xff) * (1 - t) + (to & 0xff) * t)
    return (r << 16) | (g << 8) | b
}
