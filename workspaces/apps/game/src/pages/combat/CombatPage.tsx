import { useCombatScene } from "../../features/fight/rendering/hooks/use-combat-scene.hook.ts";

export function CombatPage() {
    const { containerRef } = useCombatScene()
    return <div ref={containerRef} style={{ width: "100%", height: "600px" }} />
}