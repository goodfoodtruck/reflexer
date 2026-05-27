import { useEffect, useRef } from "react"
import { CombatScene } from "../CombatScene"

export function useCombatScene() {
    const containerRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<CombatScene | null>(null)

    useEffect(() => {
        if (!containerRef.current) return

        let active = true

        CombatScene.create(containerRef.current).then(scene => {
            if (!active) {
                scene.destroy()
                return
            }
            sceneRef.current = scene

            scene.setup({ mapId: "test", entities: [] })
        })

        return () => {
            active = false
            sceneRef.current?.destroy()
            sceneRef.current = null
        }
    }, [])

    return { containerRef, sceneRef }
}