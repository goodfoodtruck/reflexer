import { ChestData, GameEngineDeps, MapData, PlayerData, RunState, ShopData, TeamMemberData, TrainingFightConfig } from "@game-engine/game-engine.types";
import { EnemyTag, FightResult } from "@fight/fight.types";
import { BuyShopItemValue, ChestError, FightError, MapError, Result, SelectMapNodeValue, ShopError } from "@game-engine/api.types";
import { InvalidStateError } from "./errors/InvalidStateError";
import { FightMapID } from "@fight/map";


export class GameEngine {

    private runState: RunState | null = null

    constructor(private readonly deps: GameEngineDeps) {}

    startNewGame(): MapData {
        const mapData = this.deps.mapGenerator.generate()

        this.runState = {
            playerData: {
                gold: 0,
                playerFloorIndex: 0
            },
            mapData,
            activeChest: null,
            activeShop: null
        }

        return mapData
    }

    selectChestReward(itemId: string): Result<PlayerData, ChestError> {
        const runState = this.getRunStateOrThrow()
        this.assertNotActiveShop()
        const activeChest = this.getActiveChestOrThrow()

        const result: Result<PlayerData, ChestError> = this.deps.chestHandler.selectReward(itemId, activeChest, runState.playerData)

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
        this.assertNotActiveChest()
        const activeShop = this.getActiveShopOrThrow()

        const result: Result<BuyShopItemValue, ShopError> = this.deps.shopHandler.buyItem(itemId, activeShop, runState.playerData)

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

    /**
     * Pour lancer un combat on a besoin des informations sur l'équipe du joueur
     * et de la configuration choisie pour le match d'entrainement
     * @param fightMapId
     * @param playerTeam 
     */
    playTrainingFight(
        fightMapId: FightMapID, 
        enemyTeamComposition: EnemyTag[],
        playerTeam: TeamMemberData[]
    ): Result<FightResult, FightError> {
        return this.deps.fightHandler.playTrainingFight(fightMapId, enemyTeamComposition, playerTeam)
    }

    playPvpFight(
        fightMapId: FightMapID,
        playerTeam: TeamMemberData[], 
        opponentTeam: TeamMemberData[]
    ): Result<FightResult, FightError> {        
        return this.deps.fightHandler.playPvpFight(fightMapId, playerTeam, opponentTeam)
    }

    playPveFight(fightMapId: FightMapID, playerTeam: TeamMemberData[], ): Result<FightResult, FightError> {
        const runState = this.getRunStateOrThrow()
        this.assertNotActiveChest()
        this.assertNotActiveShop()
        
        const result: Result<FightResult, FightError> = this.deps.fightHandler.playPveFight(fightMapId, playerTeam, runState.playerData)

        if (! result.success) return result

        this.runState = {
            ...runState,
            playerData: this.deps.fightHandler.applyFightResultOnPlayer(runState.playerData, result.value)
        }

        return result
    }

    getRunStateOrThrow(): RunState {
        if (! this.runState) throw new InvalidStateError("GameEngine has no RunState.")
        return this.runState
    }

    getPlayerData(): PlayerData {
        return this.getRunStateOrThrow().playerData
    }

    private assertNotActiveChest(): void {
        if (this.getRunStateOrThrow().activeChest !== null)
            throw new InvalidStateError("Cannot perform action while a chest is active.")
    }

    private assertNotActiveShop(): void {
        if (this.getRunStateOrThrow().activeShop !== null)
            throw new InvalidStateError("Cannot perform action while a shop is active.")
    }

    private getActiveChestOrThrow(): ChestData {
        const activeChest = this.getRunStateOrThrow().activeChest
        if (! activeChest)
            throw new InvalidStateError("No active chest.")

        return activeChest
    }

    private getActiveShopOrThrow(): ShopData {
        const activeShop = this.getRunStateOrThrow().activeShop
        if (! activeShop)
            throw new InvalidStateError("No active shop.")

        return activeShop
    }
}
