import { describe, expect, it } from "vitest"
import { buildPlayerData } from "@tests/builders/engine/PlayerDataBuilder";
import { buildEngine } from "@tests/builders/engine/GameEngineBuilder";

describe('Démarrer une nouvelle partie', () => {

    it("retourne une carte au démarrage", () => {
        const engine = buildEngine()
        const map = engine.startNewGame(buildPlayerData())
        expect(map).toBeDefined()
    })

    it("lève une erreur si on tente une action sans avoir démarré de partie", () => {
        const engine = buildEngine()
        expect(() => engine.selectMapNode("node_1")).toThrow("GameEngine has no RunState.")
        expect(() => engine.playPveFight("map_1")).toThrow("GameEngine has no RunState.")
        expect(() => engine.buyShopItem("item_1")).toThrow("GameEngine has no RunState.")
        expect(() => engine.selectChestReward("item_1")).toThrow("GameEngine has no RunState.")
    })

    it("réinitialise la carte au démarrage d'une nouvelle partie", () => {
        const engine = buildEngine()
        engine.startNewGame(buildPlayerData())
        const secondMap = engine.startNewGame(buildPlayerData())
        expect(secondMap).toBeDefined()
    })
})