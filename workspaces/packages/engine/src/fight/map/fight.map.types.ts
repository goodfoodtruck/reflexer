import { Position, Dimensions } from "@helpers/types/helpers.types"

export type FightMapID = string

export enum EFightMapSize {
    SMALL_RANGE = "SMALL_RANGE",
    MID_RANGE = "MID_RANGE",
    LONG_RANGE = "LONG_RANGE"
}

export enum EObstacleType {
    HOLE = "HOLE",
    WALL = "WALL",
    FLOOR = "FLOOR",
}

export type FightMapSpawnPoints = {
    player: Position[]
    enemy: Position[]
}

export type FightMapConfig = {
    id: FightMapID
    dimensions: Dimensions
    size: EFightMapSize
    cells: EObstacleType[][]
    spawnPoints: FightMapSpawnPoints
    background?: string
}

export type MapCell = {
    position: Position,
    type: EObstacleType
}