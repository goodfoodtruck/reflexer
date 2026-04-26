import { buildEngine } from "@tests/builders/GameEngineBuilder";
import { buildPlayerData } from "@tests/builders/PlayerDataBuilder";
import { describe, expect, it } from "vitest";

describe("Exécuter un combat complet", () => {
    
    it("Renvoie une erreur si aucune partie n'est en cours", () => {
        const engine = buildEngine()
        expect(() => engine.playFight("map_1")).toThrow("ERROR: GameEngine has no RunState.")
    })

    it("Renvoie une erreur si la map n'existe pas", () => {
        const engine = buildEngine({
            fightHandler: {
                playFight: () => ({ success: false, reason: "MAP_NOT_FOUND" }),
                applyFightResultOnPlayer: (p) => p
            }
        })
        engine.startNewGame(buildPlayerData())

        const result = engine.playFight("notExistingMapId")

        expect(result).toEqual({ success: false, reason: "MAP_NOT_FOUND" })
    })

    it("Met à jour le state après un combat réussit", () => {
        const updatedPlayerData = buildPlayerData({ gold: 100 })
        const engine = buildEngine({
            fightHandler: {
                playFight: () => ({ success: true, value: { endState: "WON", logs: [] } }),
                applyFightResultOnPlayer: () => updatedPlayerData
            }
        })

        engine.startNewGame(buildPlayerData({ gold: 0 }))
        engine.playFight("map_1")

        expect(engine.getPlayerData()).toEqual(updatedPlayerData)
    })

    it("Ne met à jour le state si le combat échoue", () => {
        const initialPlayerData = buildPlayerData({ gold: 0 })
        const engine = buildEngine({
            fightHandler: {
                playFight: () => ({ success: false, reason: "MAP_NOT_FOUND" }),
                applyFightResultOnPlayer: (p) => p
            }
        })

        engine.startNewGame(initialPlayerData)
        engine.playFight("notExistingMapId")

        expect(engine.getPlayerData()).toEqual(initialPlayerData)
    })
})