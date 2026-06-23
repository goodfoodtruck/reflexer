import { useEffect, useReducer, useRef } from "react"
import { InMemoryFightMapRegistry, MOCK_FIGHT_MAPS, InMemoryCharacterRegistry, MOCK_ENEMY_CONFIGS } from "@reflexer/engine"
import { CombatScene } from "../CombatScene"
import { AnimationQueue } from "../../replay/AnimationQueue"
import { CombatReplayer } from "../../replay/CombatReplayer"
import { combatViewReducer, INITIAL_COMBAT_VIEW_STATE } from "../../replay/combat-view.reducer"
import type { BasePvpFight } from "../../../../shared/types/fight.types"
import { CharacterService } from "@services/character.service"
import { buildCatalogCharacterConfig } from "./Buildcatalogcharacterconfig "

export function useCombatScene(fight: BasePvpFight, isTransitionFinished: boolean) {
    const containerRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<CombatScene | null>(null)
    const [state, dispatch] = useReducer(combatViewReducer, INITIAL_COMBAT_VIEW_STATE)

    useEffect(() => {
        if (!isTransitionFinished) return
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

                // Ennemis : config mockée, déjà prête (ALIEN/KNIGHT/GOBLIN).
                // Persos joueurs : leur EntityName est leur `slug` ; on va chercher leur fiche en DB et on construit leur visuel
                const catalogCharacters = await CharacterService.getAll().catch(() => [])

                const catalogConfigs: Record<string, ReturnType<typeof buildCatalogCharacterConfig>> = {}
                for (const character of catalogCharacters) {
                    catalogConfigs[character.slug] = buildCatalogCharacterConfig(character)
                }

                const characterRegistry = new InMemoryCharacterRegistry({
                    ...MOCK_ENEMY_CONFIGS,
                    ...catalogConfigs,
                })

                const replayer = new CombatReplayer(scene, queue, dispatch, mapRegistry, characterRegistry)

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
    }, [isTransitionFinished])

    return { containerRef, sceneRef, state }
}
