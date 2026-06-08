import { useEffect, useReducer, useRef } from "react"
import type { FightResult } from "@reflexer/engine"
import { createGameEngine, InMemoryFightMapRegistry, MOCK_FIGHT_MAPS, InMemoryCharacterRegistry, MOCK_CHARACTERS } from "@reflexer/engine"
import { CombatScene } from "../CombatScene"
import { AnimationQueue } from "../../replay/AnimationQueue"
import { CombatReplayer } from "../../replay/CombatReplayer"
import { combatViewReducer, INITIAL_COMBAT_VIEW_STATE } from "../../replay/combat-view.reducer"

// Équipe du joueur dérivée des personnages mockés : le moteur attend désormais
// des `TeamMemberData` complets (stats + gambits), passés directement au combat.
const PLAYER_TEAM_NAMES = ["CHARACTER_1", "CHARACTER_2"] as const

const MOCK_PLAYER_TEAM = PLAYER_TEAM_NAMES.map(characterName => {
    const config = MOCK_CHARACTERS[characterName]
    return {
        characterName,
        baseStats: config.baseStats,
        gambits: config.gambits,
        activePassiveIds: [],
    }
})

const FIGHT_MAP_ID = "TRAINING_GROUND"

/** Joue un vrai combat via le moteur et renvoie son `FightResult` à rejouer. */
function runFight(): FightResult {
    const engine = createGameEngine()
    engine.startNewGame()

    const result = engine.playPveFight(FIGHT_MAP_ID, MOCK_PLAYER_TEAM)
    if (!result.success)
        throw new Error(`Combat impossible : ${result.reason}`)

    return result.value
}

export function useCombatScene() {
    const containerRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<CombatScene | null>(null)
    const [state, dispatch] = useReducer(combatViewReducer, INITIAL_COMBAT_VIEW_STATE)

    useEffect(() => {
        if (!containerRef.current) return

        let cancelled = false

        CombatScene
            .create(containerRef.current)
            .then(scene => {
                if (cancelled) {
                    scene.destroy()
                    return
                }
                sceneRef.current = scene

                const queue = new AnimationQueue(scene)
                const mapRegistry = new InMemoryFightMapRegistry(MOCK_FIGHT_MAPS)
                const characterRegistry = new InMemoryCharacterRegistry(MOCK_CHARACTERS)
                const replayer = new CombatReplayer(scene, queue, dispatch, mapRegistry, characterRegistry)
                replayer.play(runFight())
            })

        return () => {
            cancelled = true
            sceneRef.current?.destroy()
            sceneRef.current = null
        }
    }, [])

    return { containerRef, sceneRef, state }
}
