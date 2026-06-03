import { AllyName, EnemyTag, EntityStats } from "@fight/fight.types"
import { Gambit } from "@fight/gambits"
import { FightMapConfig, FightMapID } from "@fight/map"
import { PassiveID } from "@fight/passives/passives.types"
import { IChestCommandHandler, IFightCommandHandler, IMapCommandHandler, IMapGenerator, IShopCommandHandler } from "@game-engine/command-handlers/handlers.interfaces"

export type GameEngineDeps = {
    mapGenerator: IMapGenerator
    mapCommandHandler: IMapCommandHandler
    fightHandler: IFightCommandHandler
    shopHandler: IShopCommandHandler
    chestHandler: IChestCommandHandler
}

export type FightConfig = 
    | PveFightConfig 
    | PvpFightConfig 
    | TrainingFightConfig

export type PveFightConfig = {
    type: "PVE"
    mapConfig: FightMapConfig
    playerTeam: TeamMemberData[]
    floorIndex: number
}

export type PvpFightConfig = {
    type: "PVP"
    mapConfig: FightMapConfig
    playerTeam: TeamMemberData[]
    opponentTeam: TeamMemberData[]
}

export type TrainingFightConfig = {
    type: "TRAINING"
    mapConfig: FightMapConfig
    enemyTeamComposition: EnemyTag[]
    playerTeam: TeamMemberData[]
}

/** données persistées du joueur envoyées par le client */
export type PlayerData = {
    playerFloorIndex: number
    gold: number
    playerTeam: TeamMemberData[]
}

export type TeamMemberData = {
    name: AllyName
    baseStats: EntityStats
    gambits: Gambit[]
    activePassiveIds: PassiveID[]
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