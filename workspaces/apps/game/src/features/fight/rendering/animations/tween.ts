import type { Ticker } from "pixi.js"

export type TweenFn = (duration: number, onUpdate: (t: number) => void) => Promise<void>

export function makeTween(ticker: Ticker): TweenFn {
    return (duration, onUpdate) => new Promise<void>(resolve => {
        let elapsed = 0
        const tick = (t: Ticker) => {
            elapsed += t.deltaMS
            const progress = Math.min(elapsed / duration, 1)
            onUpdate(progress)
            if (progress >= 1) {
                ticker.remove(tick)
                resolve()
            }
        }
        ticker.add(tick)
    })
}

export function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3)
}
