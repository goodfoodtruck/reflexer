import { EnemyTag, FightResult } from "@fight/fight.types"
import { FightMapID } from "@fight/map/fight.map.types"
import { Result, SelectMapNodeValue, MapError, FightError, BuyShopItemValue, ShopError, ChestError } from "@game-engine/api.types"
import { MapData, RunPlayerData, ShopData, ChestData, TeamMemberData, TrainingFightConfig } from "@game-engine/game-engine.types"

export interface IMapGenerator {
    generate(): MapData
}

export interface IMapCommandHandler {
    selectMapNode(nodeId: string, mapData: MapData, floorIndex: number): Result<SelectMapNodeValue, MapError>
}

export interface IFightCommandHandler {
    playPvpFight(fightMapId: FightMapID, playerTeam: TeamMemberData[], opponentTeam: TeamMemberData[]): Result<FightResult, FightError>
    playPveFight(fightMapId: FightMapID, playerTeam: TeamMemberData[], runPlayerData: RunPlayerData): Result<FightResult, FightError>
    playTrainingFight(fightMapId: FightMapID, enemyTeamComposition: EnemyTag[], playerTeam: TeamMemberData[]): Result<FightResult, FightError>
    applyFightResultOnPlayer(runPlayerData: RunPlayerData, result: FightResult): RunPlayerData
}

export interface IShopCommandHandler {
    buyItem(itemId: string, shopData: ShopData, runPlayerData: RunPlayerData): Result<BuyShopItemValue, ShopError>
}

export interface IChestCommandHandler {
    selectReward(itemId: string, chestData: ChestData, runPlayerData: RunPlayerData): Result<RunPlayerData, ChestError>
}

export interface ISaveManager {
    save(runPlayerData: RunPlayerData, mapData: MapData): void
    load(saveId: string): { runPlayerData: RunPlayerData; mapData: MapData } | null
}