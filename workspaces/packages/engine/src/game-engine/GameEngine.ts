import { GameEngineDeps, MapData, PlayerData, RunState } from "./game-engine.types";
import { FightResult } from "@fight/fight.types";
import { BuyShopItemValue, ChestError, FightError, MapError, Result, SelectMapNodeValue, ShopError } from "./api.types";


export class GameEngine {

    private runState: RunState | null = null

    constructor(private readonly deps: GameEngineDeps) {}

    startNewGame(playerData: PlayerData): MapData {
        const mapData = this.deps.mapGenerator.generate()

        this.runState = {
            playerData,
            mapData,
            activeChest: null,
            activeShop: null
        }

        return mapData
    }

    selectChestReward(itemId: string): Result<PlayerData, ChestError> {
        const runState = this.getRunStateOrThrow()
        if (! runState.activeChest)
            return { success: false, reason: "CHEST_NOT_ACTIVE" }

        const result: Result<PlayerData, ChestError> = this.deps.chestHandler.selectReward(itemId, runState.activeChest, runState.playerData)

        if (! result.success) return result

        // si succès, on MAJ le state
        this.runState = {
            ...runState,
            playerData: result.value,
            activeChest: null
        }

        return result
    }

    buyShopItem(itemId: string): Result<BuyShopItemValue, ShopError> {
        const runState = this.getRunStateOrThrow()
        if (! runState.activeShop)
            return { success: false, reason: "SHOP_NOT_ACTIVE" }

        const result: Result<BuyShopItemValue, ShopError> = this.deps.shopHandler.buyItem(itemId, runState.activeShop, runState.playerData)

        if (! result.success) return result

        // si succès, on MAJ le state
        this.runState = {
            ...runState,
            playerData: result.value.updatedPlayerData,
            activeShop: result.value.updatedShopData
        }

        return result
    }

    selectMapNode(nodeId: string): Result<SelectMapNodeValue, MapError> {
        const runState = this.getRunStateOrThrow()
        const result: Result<SelectMapNodeValue, MapError> = this.deps.mapCommandHandler.selectMapNode(nodeId, runState.mapData, runState.playerData.playerFloorIndex)

        if (! result.success) return result

        if (result.value.nodeType === "COMBAT") 
            this.runState = { ...runState, activeChest: null, activeShop: null }
        else if (result.value.nodeType === "CHEST") 
            this.runState = { ...runState, activeChest: result.value.chestData, activeShop: null }
        else if (result.value.nodeType === "SHOP") 
            this.runState = { ...runState, activeShop: result.value.shopData, activeChest: null }
        
        return result
    }

    playFight(fightMapId: string): Result<FightResult, FightError> {
        const runState = this.getRunStateOrThrow()
        const result: Result<FightResult, FightError> = this.deps.fightHandler.playFight(fightMapId, runState.playerData)

        if (! result.success) return result

        this.runState = {
            ...runState,
            playerData: this.deps.fightHandler.applyFightResultOnPlayer(runState.playerData, result.value)
        }

        return result
    }

    private getRunStateOrThrow(): RunState {
        if (! this.runState) throw new Error("ERROR: GameEngine has no RunState.")
        return this.runState
    }

    getPlayerData(): PlayerData {
        return this.getRunStateOrThrow().playerData
    }
}
