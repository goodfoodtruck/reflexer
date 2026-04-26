import { describe, expect, it } from "vitest"
import { GameEngine } from "./GameEngine"
import { PlayerData } from "./game-engine.types"

const buildPlayerData = (overrides: Partial<PlayerData> = {}): PlayerData => ({
    playerFloorIndex: 1,
    gold: 0,
    ...overrides
})

const buildEngine = (): GameEngine => new GameEngine(
    { generate: () => ({}) },
    { selectMapNode: () => ({ success: true, value: { nodeType: "COMBAT", fightMapId: "map_1" } }) },
    { playFight: () => ({ success: true, value: { endState: "WON", logs: [] } }), applyFightResultOnPlayer: (p) => p },
    { buyItem: () => ({ success: true, value: { updatedPlayerData: buildPlayerData(), updatedShopData: {} } }) },
    { selectReward: () => ({ success: true, value: buildPlayerData() }) }
)

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