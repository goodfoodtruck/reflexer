import { Gambit } from "@gambits/gambits.types"
import { Position, Dimensions } from "@helpers/types/helpers.types"

export type ActionID = string

export type ActionLog = {}

export type TurnLog = {
    turnIndex: number
    actionLogs: ActionLog[]
}



export type FightState =
    | { status: "RUNNING" }
    | { status: "ENDED"; result: FightResult }

export type FightResult = {
    endState: FightEndState
    logs: TurnLog[]
}

export type FightEndState =
    | "WON"
    | "LOST"
    | { kind: "INTERRUPTED"; reason: "MAX_TURNS_REACHED" | "TURN_LOOP" }



    
export type PlayerContext = {
    playerFloorIndex: number
}


export type PlayingTeamID = "PLAYER" | "ENEMY"
export type PlayingEntityID = string
export type PassiveEffectID = string

export type EntityTag =
    | "PLAYER"
    | "ENEMY_MELEE"
    | "ENEMY_RANGED"
    | "ENEMY_BOSS"

export type PlayingEntity = {
    id: PlayingEntityID
    teamId: PlayingTeamID
    tags: EntityTag[]
    position: Position
    baseStats: Readonly<EntityStats>
    currentStats: EntityStats
    gambits: Gambit[]
    passives: PassiveEffectID[]
    isDead: boolean
}

export type EntityStats = {
    health: number
    energy: number
}

export enum EObstacleType {
    HOLE
}

export type TileEffectConfig = {
    actionId: ActionID 
}

export type CellConfig = {
    walkable: boolean
    obstacle?: EObstacleType
    effect?: TileEffectConfig
}

export type FightMapSpawnPoints = {
    player: Position[]
    enemy: Position[]
}

export type FightMapConfig = {
    dimensions: Dimensions
    cells: CellConfig[][]
    spawnPoints: FightMapSpawnPoints
}

export type MapCell = CellConfig & { position: Position }