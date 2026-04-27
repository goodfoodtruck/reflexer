import { InvalidStateError } from "@game-engine/errors/InvalidStateError";
import { buildEngine } from "@tests/builders/engine/GameEngineBuilder";
import { buildPlayerData } from "@tests/builders/engine/PlayerDataBuilder";
import { describe, expect, it } from "vitest";

describe("Sélectionner un noeud dans la carte du jeu", () => {
    
    it("Ne met pas à jour le state en cas d'erreur", () => {
        const engine = buildEngine({
            mapCommandHandler: {
                selectMapNode: () => ({ success: false, reason: "INVALID_NODE_TYPE" }),
            }
        })
        engine.startNewGame(buildPlayerData())
        const initialRunState = engine.getRunStateOrThrow()

        const _ = engine.selectMapNode("notExistingNodeId")

        const runStateAfterCall = engine.getRunStateOrThrow()

        expect(runStateAfterCall).toEqual(initialRunState)
    })

    it("On peut lancer un combat après avoir sélectionné noeud de type combat", () => {
        const engine = buildEngine({
            mapCommandHandler: {
                selectMapNode: () => ({ success: true,  value: { nodeType: "COMBAT", fightMapId: "map_1" } }),
            }
        })
        
        engine.startNewGame(buildPlayerData())
        engine.selectMapNode("existingNodeId")

        const result = engine.playFight("map_1")
        expect(result.success).toBe(true)
    })

    it("On ne peut pas ouvrir un coffre ou acheter un item dans le shop après avoir sélectionné noeud de type combat", () => {
        const engine = buildEngine({
            mapCommandHandler: {
                selectMapNode: () => ({ success: true,  value: { nodeType: "COMBAT", fightMapId: "map_1" } }),
            }
        })
        
        engine.startNewGame(buildPlayerData())
        engine.selectMapNode("existingNodeId")

        expect(() => engine.selectChestReward("reward_1")).toThrow(InvalidStateError)
        expect(() => engine.buyShopItem("shop_item_1")).toThrow(InvalidStateError)
    })

    it("On ne peut qu'acheter un item du shop une fois entré dans un shop", () => {
        const engine = buildEngine({
            mapCommandHandler: {
                selectMapNode: () => ({ success: true,  value: { nodeType: "SHOP", shopData: {} } }),
            }
        })
        
        engine.startNewGame(buildPlayerData())
        engine.selectMapNode("existingNodeId")

        const shopResult = engine.buyShopItem("shop_item_1")

        expect(() => engine.selectChestReward("reward_1")).toThrow(InvalidStateError)
        expect(() => engine.playFight("map_1")).toThrow(InvalidStateError)
        expect(shopResult.success).toBe(true)
    })

    it("On ne peut que sélectionner une récompense du coffre une fois un coffre ouvert", () => {
        const engine = buildEngine({
            mapCommandHandler: {
                selectMapNode: () => ({ success: true,  value: { nodeType: "CHEST", chestData: {} } }),
            }
        })
        
        engine.startNewGame(buildPlayerData())
        engine.selectMapNode("existingNodeId")

        expect(() => engine.buyShopItem("item_1")).toThrow(InvalidStateError)
        expect(() => engine.playFight("map_1")).toThrow(InvalidStateError)

        const chestResult = engine.selectChestReward("chest_reward_1")
        expect(chestResult.success).toBe(true)
    })
})