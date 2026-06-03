import { buildEngine } from "@tests/builders/engine/GameEngineBuilder"
import { buildPlayerData } from "@tests/builders/engine/PlayerDataBuilder"
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder"
import { describe, expect, it } from "vitest"

describe("Exécuter un combat complet", () => {

    const context = buildFightContext()
    const initialState = context.toSnapshot()

    it("renvoie une erreur si aucune partie n'est en cours", () => {
        const engine = buildEngine()
        expect(() => engine.playPveFight("map_1")).toThrow("GameEngine has no RunState.")
    })

    it("renvoie une erreur si la map n'existe pas", () => {
        const engine = buildEngine({
            fightHandler: {
                playPveFight: () => ({ success: false, reason: "MAP_NOT_FOUND" }),
                playPvpFight: () => ({ success: false, reason: "MAP_NOT_FOUND" }),
                playTrainingFight: () => ({ success: false, reason: "MAP_NOT_FOUND" }),
                applyFightResultOnPlayer: (p) => p
            }
        })
        engine.startNewGame(buildPlayerData())

        const result = engine.playPveFight("notExistingMapId")

        expect(result).toEqual({ success: false, reason: "MAP_NOT_FOUND" })
    })

    it("met à jour le state après un combat réussi", () => {
        const updatedPlayerData = buildPlayerData({ gold: 100 })
        const engine = buildEngine({
            fightHandler: {
                playPveFight: () => ({
                    success: true,
                    value: {
                        endState: "WON",
                        logs: [],
                        initialState
                    }
                }),
                playPvpFight: () => ({ success: false, reason: "MAP_NOT_FOUND" }),
                playTrainingFight: () => ({ success: false, reason: "MAP_NOT_FOUND" }),
                applyFightResultOnPlayer: () => updatedPlayerData
            }
        })

        engine.startNewGame(buildPlayerData({ gold: 0 }))
        engine.playPveFight("map_1")

        expect(engine.getPlayerData()).toEqual(updatedPlayerData)
    })

    it("ne met pas à jour le state si le combat échoue", () => {
        const initialPlayerData = buildPlayerData({ gold: 0 })
        const engine = buildEngine({
            fightHandler: {
                playPveFight: () => ({ success: false, reason: "MAP_NOT_FOUND" }),
                playPvpFight: () => ({ success: false, reason: "MAP_NOT_FOUND" }),
                playTrainingFight: () => ({ success: false, reason: "MAP_NOT_FOUND" }),
                applyFightResultOnPlayer: (p) => p
            }
        })

        engine.startNewGame(initialPlayerData)
        engine.playPveFight("notExistingMapId")

        expect(engine.getPlayerData()).toEqual(initialPlayerData)
    })
})