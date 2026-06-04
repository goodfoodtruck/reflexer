import { useEffect, useReducer, useRef } from "react"
import type { FightResult, PlayerData } from "@reflexer/engine"
import { createGameEngine, InMemoryFightMapRegistry, MOCK_FIGHT_MAPS, InMemoryCharacterRegistry, MOCK_CHARACTERS } from "@reflexer/engine"
import { CombatScene } from "../CombatScene"
import { LogInterpreter } from "../../replay/LogInterpreter"
import { AnimationQueue } from "../../replay/AnimationQueue"
import { CombatReplayer } from "../../replay/CombatReplayer"
import { combatViewReducer, INITIAL_COMBAT_VIEW_STATE } from "../../replay/combat-view.reducer"

const MOCK_PLAYER_DATA: PlayerData = {
    teamComposition: ["CHARACTER_1", "CHARACTER_2"],
    playerFloorIndex: 1,
    gold: 0,
}

const FIGHT_MAP_ID = "TRAINING_GROUND"

/** Joue un vrai combat via le moteur et renvoie son `FightResult` à rejouer. */
function runFight(): FightResult {
    const engine = createGameEngine()
    engine.startNewGame(MOCK_PLAYER_DATA)

    const result = engine.playFight(FIGHT_MAP_ID)
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

                const interpreter = new LogInterpreter()
                const queue = new AnimationQueue(scene)
                const mapRegistry = new InMemoryFightMapRegistry(MOCK_FIGHT_MAPS)
                const characterRegistry = new InMemoryCharacterRegistry(MOCK_CHARACTERS)
                const replayer = new CombatReplayer(scene, interpreter, queue, dispatch, mapRegistry, characterRegistry)
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
