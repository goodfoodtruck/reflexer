import { describe, expect, it } from "vitest"
import { buildEngine } from "@test-utils/builders/GameEngineBuilder"
import { buildPlayerData } from "@test-utils/builders/PlayerDataBuilder"

describe('Démarrer une nouvelle partie', () => {

    it("retourne une carte au démarrage", () => {
        const engine = buildEngine()
        const map = engine.startNewGame(buildPlayerData())
        expect(map).toBeDefined()
    })

    it("lève une erreur si on tente une action sans avoir démarré de partie", () => {
        const engine = buildEngine()
        expect(() => engine.selectMapNode("node_1")).toThrow("Aucune partie en cours — appeler startNewGame() d'abord")
        expect(() => engine.playFight("map_1")).toThrow("Aucune partie en cours — appeler startNewGame() d'abord")
        expect(() => engine.buyShopItem("item_1")).toThrow("Aucune partie en cours — appeler startNewGame() d'abord")
        expect(() => engine.selectChestReward("item_1")).toThrow("Aucune partie en cours — appeler startNewGame() d'abord")
    })

    it("réinitialise la carte au démarrage d'une nouvelle partie", () => {
        const engine = buildEngine()
        engine.startNewGame(buildPlayerData())
        const secondMap = engine.startNewGame(buildPlayerData())
        expect(secondMap).toBeDefined()
    })
})