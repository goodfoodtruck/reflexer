import { IChestCommandHandler, IFightCommandHandler, IMapCommandHandler, IMapGenerator, IShopCommandHandler } from "@game-engine/command-handlers/handlers.interfaces"

export type GameEngineDeps = {
    mapGenerator: IMapGenerator
    mapCommandHandler: IMapCommandHandler
    fightHandler: IFightCommandHandler
    shopHandler: IShopCommandHandler
    chestHandler: IChestCommandHandler
}

export type PlayerData = {
    playerFloorIndex: number,
    gold: number
}

export type ShopData = {}
export type ChestData = {}

export type MapData = {}

export type RunState = {
    // données persistantes
    playerData: PlayerData
    mapData: MapData
    
    // sessions en cours — nullable car temporaires
    activeChest: ChestData | null
    activeShop: ShopData | null
}

