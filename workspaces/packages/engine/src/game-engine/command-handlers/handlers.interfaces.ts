import { FightResult } from "@fight/fight.types"
import { Result, SelectMapNodeValue, MapError, FightError, BuyShopItemValue, ShopError, ChestError } from "@game-engine/api.types"
import { MapData, PlayerData, ShopData, ChestData } from "@game-engine/game-engine.types"

export interface IMapGenerator {
    generate(): MapData
}

export interface IMapCommandHandler {
    selectMapNode(nodeId: string, mapData: MapData, floorIndex: number): Result<SelectMapNodeValue, MapError>
}

export interface IFightCommandHandler {
    playFight(fightMapId: string, playerData: PlayerData): Result<FightResult, FightError>
    applyFightResultOnPlayer(playerData: PlayerData, result: FightResult): PlayerData
}

export interface IShopCommandHandler {
    buyItem(itemId: string, shopData: ShopData, playerData: PlayerData): Result<BuyShopItemValue, ShopError>
}

export interface IChestCommandHandler {
    selectReward(itemId: string, chestData: ChestData, playerData: PlayerData): Result<PlayerData, ChestError>
}

export interface ISaveManager {
    save(playerData: PlayerData, mapData: MapData): void
    load(saveId: string): { playerData: PlayerData; mapData: MapData } | null
}