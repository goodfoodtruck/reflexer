import { useEffect, useRef } from "react"
import type { FightResult } from "@reflexer/engine"
import { InMemoryFightMapRegistry, MOCK_FIGHT_MAPS } from "@reflexer/engine"
import { CombatScene } from "../CombatScene"
import { LogInterpreter } from "../../replay/LogInterpreter"
import { AnimationQueue } from "../../replay/AnimationQueue"
import { CombatReplayer } from "../../replay/CombatReplayer"
import { CombatViewStore } from "../../replay/CombatViewStore"

const FAKE_FIGHT: FightResult = {
    initialState: {
        mapId: "TRAINING_GROUND",
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
                id: "hero2",
                teamId: "PLAYER",
                tags: ["CHARACTER_2"],
                position: { x: 1, y: 6 },
                currentStats: { health: 90, energy: 40 },
                passives: [],
            },
            {
                id: "enemy",
                teamId: "ENEMY",
                tags: ["ENEMY_MELEE"],
                position: { x: 8, y: 4 },
                currentStats: { health: 80, energy: 30 },
                passives: [],
            },
            {
                id: "enemy2",
                teamId: "ENEMY",
                tags: ["ENEMY_MELEE"],
                position: { x: 8, y: 6 },
                currentStats: { health: 70, energy: 20 },
                passives: [],
            },
        ],
    },
    endState: "WON",
    logs: [
        { turnIndex: 0, ownerId: "hero", actionLogs: [{ type: "entity_moved", entityId: "hero", cell: { x: 3, y: 4 } }] },
        { turnIndex: 0, ownerId: "enemy", actionLogs: [{ type: "entity_moved", entityId: "enemy", cell: { x: 6, y: 4 } }] },
        { turnIndex: 0, ownerId: "hero2", actionLogs: [{ type: "entity_moved", entityId: "hero2", cell: { x: 3, y: 6 } }] },
        { turnIndex: 0, ownerId: "enemy2", actionLogs: [{ type: "entity_moved", entityId: "enemy2", cell: { x: 6, y: 6 } }] },
        {
            turnIndex: 1,
            ownerId: "hero",
            actionLogs: [
                { type: "damage_dealt", sourceId: "hero", actionId: "attack", targetId: "enemy", amount: 30, reactionDepth: 0 },
                { type: "passive_applied", sourceId: "hero", targetId: "enemy", passiveId: "bleed" },
            ],
        },
        {
            turnIndex: 1,
            ownerId: "enemy",
            actionLogs: [{ type: "damage_dealt", sourceId: "enemy", actionId: "attack", targetId: "hero", amount: 25, reactionDepth: 0 }],
        },
        {
            turnIndex: 1,
            ownerId: "hero2",
            actionLogs: [{ type: "damage_dealt", sourceId: "hero2", actionId: "attack", targetId: "enemy2", amount: 20, reactionDepth: 0 }],
        },
        {
            turnIndex: 1,
            ownerId: "enemy2",
            actionLogs: [{ type: "damage_dealt", sourceId: "enemy2", actionId: "attack", targetId: "hero2", amount: 15, reactionDepth: 0 }],
        },
        {
            turnIndex: 2,
            ownerId: "hero",
            actionLogs: [
                { type: "damage_dealt", sourceId: "hero", actionId: "attack", targetId: "enemy", amount: 30, reactionDepth: 0 },
                { type: "damage_dealt", sourceId: "hero", actionId: "attack", targetId: "enemy", amount: 30, reactionDepth: 0 },
                { type: "entity_died", entityId: "enemy" },
            ],
        },
        {
            turnIndex: 2,
            ownerId: "hero2",
            actionLogs: [
                { type: "damage_dealt", sourceId: "hero2", actionId: "attack", targetId: "enemy2", amount: 40, reactionDepth: 0 },
                { type: "entity_died", entityId: "enemy2" },
            ],
        },
    ],
}

export function useCombatScene() {
    const containerRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<CombatScene | null>(null)
    const storeRef = useRef<CombatViewStore | null>(null)
    if (!storeRef.current) storeRef.current = new CombatViewStore()
    const store = storeRef.current

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
            const mapRegistry = new InMemoryFightMapRegistry(MOCK_FIGHT_MAPS)
            const replayer = new CombatReplayer(scene, interpreter, queue, store, mapRegistry)
            replayer.play(FAKE_FIGHT)
        })

        return () => {
            active = false
            sceneRef.current?.destroy()
            sceneRef.current = null
        }
    }, [store])

    return { containerRef, sceneRef, store }
}
