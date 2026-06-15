import { useEffect, useRef } from "react"
import type { RefObject } from "react"
import type { PlayingEntityID } from "@reflexer/engine"
import type { CombatScene } from "../../../features/fight/rendering/CombatScene"
import type { EntityView } from "../../../features/fight/replay/combat-view.types"

type Props = {
    sceneRef: RefObject<CombatScene | null>
    entities: Record<PlayingEntityID, EntityView>
}

/**
 * Barres de vie HTML au-dessus de chaque entité vivante. La position suit le
 * sprite Pixi en continu (boucle rAF, écriture impérative du transform), tandis
 * que la valeur de vie provient de l'état de vue (re-render React ponctuel).
 */
export function HealthBarsOverlay({ sceneRef, entities }: Props) {
    const barRefs = useRef<Map<string, HTMLDivElement>>(new Map())

    useEffect(() => {
        let raf = 0
        const update = () => {
            const scene = sceneRef.current
            if (scene) {
                for (const [id, el] of barRefs.current) {
                    const pos = scene.getEntityScreenPosition(id)
                    if (!pos) {
                        el.style.display = "none"
                        continue
                    }
                    el.style.display = ""
                    el.style.transform =
                        `translate(-50%, -100%) translate(${pos.x}px, ${pos.y - scene.cellSize * 0.45}px)`
                }
            }
            raf = requestAnimationFrame(update)
        }
        raf = requestAnimationFrame(update)
        return () => cancelAnimationFrame(raf)
    }, [sceneRef])

    const livingEntities = Object.values(entities).filter(entity => entity.alive)

    return (
        <div className="absolute inset-0 pointer-events-none">
            {livingEntities.map(entity => {
                const hpRatio = entity.maxHp > 0 ? entity.hp / entity.maxHp : 0
                return (
                    <div
                        key={entity.id}
                        ref={el => {
                            if (el) barRefs.current.set(entity.id, el)
                            else barRefs.current.delete(entity.id)
                        }}
                        className="absolute top-0 left-0 will-change-transform flex flex-col gap-0.5"
                    >
                        <div className="w-12 h-1.5 rounded-full bg-slate-900/80 ring-1 ring-black/40 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-[width] duration-300 ${
                                    entity.teamId === "PLAYER" ? "bg-emerald-400" : "bg-rose-400"
                                }`}
                                style={{ width: `${Math.round(hpRatio * 100)}%` }}
                            />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
