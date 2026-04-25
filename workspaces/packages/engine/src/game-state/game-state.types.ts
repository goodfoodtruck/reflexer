import { FightResult } from "@fight/fight.types"

export type PlayerData = {
    playerFloorIndex: number,
    gold: number
}

export type MapData = {}
export type ShopData = {}
export type ChestData = {}

export type GameState =
    | { mode: "MAP",    mapData: MapData,     playerData: PlayerData }
    | { mode: "COMBAT", result: FightResult,  playerData: PlayerData }
    | { mode: "SHOP",   shop: ShopData,       playerData: PlayerData }
    | { mode: "CHEST",  chest: ChestData,     playerData: PlayerData }

export type PlayerCommand = 
    | { type: "GENERATE_MAP" }
    | { type: "PLAY_FIGHT" }
    | { type: "ENTER_SHOP" }
    | { type: "OPEN_CHEST" }
