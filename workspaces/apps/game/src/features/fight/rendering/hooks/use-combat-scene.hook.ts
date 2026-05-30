import { useEffect, useRef } from "react"
import type { FightResult } from "@reflexer/engine"
import { CombatScene } from "../CombatScene"
import { LogInterpreter } from "../../replay/LogInterpreter"
import { AnimationQueue } from "../../replay/AnimationQueue"
import { CombatReplayer } from "../../replay/CombatReplayer"

const FAKE_FIGHT: FightResult = {
    initialState: {
        mapId: "test",
        entities: [
            {
                id: "hero",
                teamId: "PLAYER",
                tags: ["CHARACTER_1"],
                position: { x: 1, y: 4 },
                currentStats: { health: 100, energy: 50 },
                passives: [],
            },
            {
                id: "enemy",
                teamId: "ENEMY",
                tags: ["ENEMY_MELEE"],
                position: { x: 7, y: 4 },
                currentStats: { health: 80, energy: 30 },
                passives: [],
            },
        ],
    },
    endState: "WON",
    logs: [
        {
            turnIndex: 0,
            actionLogs: [
                { type: "entity_moved", entityId: "hero", cell: { x: 3, y: 4 } },
                { type: "entity_moved", entityId: "enemy", cell: { x: 5, y: 4 } },
            ],
        },
        {
            turnIndex: 1,
            actionLogs: [
                { type: "damage_dealt", sourceId: "hero", actionId: "attack", targetId: "enemy", amount: 30, reactionDepth: 0 },
                { type: "passive_applied", sourceId: "hero", targetId: "enemy", passiveId: "bleed" },
            ],
        },
        {
            turnIndex: 2,
            actionLogs: [
                { type: "damage_dealt", sourceId: "enemy", actionId: "attack", targetId: "hero", amount: 50, reactionDepth: 0 },
                { type: "damage_dealt", sourceId: "enemy", actionId: "attack", targetId: "hero", amount: 50, reactionDepth: 0 },
                { type: "entity_died", entityId: "hero" },
            ],
        },
    ],
}

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

            const interpreter = new LogInterpreter()
            const queue = new AnimationQueue(scene)
            const replayer = new CombatReplayer(scene, interpreter, queue)
            replayer.play(FAKE_FIGHT)
        })

        return () => {
            active = false
            sceneRef.current?.destroy()
            sceneRef.current = null
        }
    }, [])

    return { containerRef, sceneRef }
}