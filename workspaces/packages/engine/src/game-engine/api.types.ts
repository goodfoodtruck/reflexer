import { ShopData, ChestData, RunPlayerData } from "@game-engine/game-engine.types"

export type GameError = 
    | "MAP_GENERATION_FAILED"

export type ShopError =
    | "SHOP_NOT_ACTIVE"
    | "ITEM_NOT_FOUND"
    | "INSUFFICIENT_GOLD"

export type ChestError =
    | "CHEST_NOT_ACTIVE"
    | "ITEM_NOT_FOUND"

export type MapError =
    | "NODE_NOT_FOUND"
    | "INVALID_NODE_TYPE"

export type FightError =
    | "MAP_NOT_FOUND"
    | "INVALID_PLAYER_STATE"

export type GameEngineError =
    | ShopError
    | ChestError
    | MapError
    | FightError

export type Result<T, R extends string = string> =
    | { success: true,  value: T }
    | { success: false, reason: R }

export type SelectMapNodeValue = 
    | { nodeType: "COMBAT", fightMapId: string }
    | { nodeType: "SHOP",   shopData: ShopData }
    | { nodeType: "CHEST",  chestData: ChestData }

export type BuyShopItemValue = {
    updatedPlayerData: RunPlayerData, 
    updatedShopData: ShopData
}