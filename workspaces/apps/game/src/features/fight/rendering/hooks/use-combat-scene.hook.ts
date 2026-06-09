import { useEffect, useReducer, useRef } from "react"
import { InMemoryFightMapRegistry, MOCK_FIGHT_MAPS, InMemoryCharacterRegistry, MOCK_CHARACTERS } from "@reflexer/engine"
import { CombatScene } from "../CombatScene"
import { AnimationQueue } from "../../replay/AnimationQueue"
import { CombatReplayer } from "../../replay/CombatReplayer"
import { combatViewReducer, INITIAL_COMBAT_VIEW_STATE } from "../../replay/combat-view.reducer"
import { FriendlyFightService } from "@services/fight/friendlyFight.service"


const PLAYER_ID = import.meta.env.VITE_FRIENDLY_PLAYER_ID ?? ""
const OPPONENT_ID = import.meta.env.VITE_FRIENDLY_OPPONENT_ID ?? ""
const FIGHT_MAP_ID = "TRAINING_GROUND"

export function useCombatScene() {
    const containerRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<CombatScene | null>(null)
    const [state, dispatch] = useReducer(combatViewReducer, INITIAL_COMBAT_VIEW_STATE)

    useEffect(() => {
        if (!containerRef.current) return

        let cancelled = false

        CombatScene
            .create(containerRef.current)
            .then(async scene => {
                if (cancelled) {
                    scene.destroy()
                    return
                }
                sceneRef.current = scene

                const queue = new AnimationQueue(scene)
                const mapRegistry = new InMemoryFightMapRegistry(MOCK_FIGHT_MAPS)
                const characterRegistry = new InMemoryCharacterRegistry(MOCK_CHARACTERS)
                const replayer = new CombatReplayer(scene, queue, dispatch, mapRegistry, characterRegistry)

                const fight = await FriendlyFightService.playFight({
                    playerId: PLAYER_ID,
                    opponentId: OPPONENT_ID,
                    fightMapId: FIGHT_MAP_ID
                })
                if (cancelled) return

                replayer.play({
                    initialState: fight.initialState,
                    logs: fight.logs,
                    endState: fight.endState
                })
            })
            .catch(error => {
                console.error("Combat : échec du chargement du combat", error)
            })

        return () => {
            cancelled = true
            sceneRef.current?.destroy()
            sceneRef.current = null
        }
    }, [])

    return { containerRef, sceneRef, state }
}
