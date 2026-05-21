import {Gambit, MovementStrategy} from "@fight/gambits/gambits.types"
import { Position, Dimensions } from "@helpers/types/helpers.types"
import { ProcessorConfig } from "@processors/processor.types";
import {IStatus} from "@fight/context/IStatus";
import { FightContext } from "./context/FightContext";


export interface DamageReceivedEvent {
    readonly ownerId: PlayingEntityID      // porteur du statut
    readonly attackerId: PlayingEntityID   // qui a infligé les dégâts
    readonly amount: number                // dégâts effectivement subis (après résistances)
    readonly reactionDepth: number         // défaut 0 pour les dégâts directs
}

export interface DamageDealtEvent {
    readonly ownerId: PlayingEntityID
    readonly targetId: PlayingEntityID
    readonly amount: number
}

export interface TurnEvent {
    readonly ownerId: PlayingEntityID
    readonly turnIndex: number
}

export type MovementContext = {
    casterId: Readonly<PlayingEntityID>;
    strategy: MovementStrategy;
    targetId: Readonly<PlayingEntityID>;
}

export type ExecutionContext = {
    casterId: Readonly<PlayingEntityID>;
    actionId: Readonly<ActionID>;
    targetId: Readonly<PlayingEntityID>;
    reactionDepth: Readonly<number>;
};

export type StatusID = string

export type ActionID = string

export type ActionCategory = "attack" | "heal" | "status";

export type Action = {
    id: Readonly<ActionID>;
    type: Readonly<ActionCategory>;
    processorConfigs: Readonly<ProcessorConfig[]>;
};

export type ActionLog =
    | DamageDealtLog
    | DamageSkippedLog
    | EntityDiedLog
    | ActionFailedLog
    | EntityMovedLog

export type DamageDealtLog = {
    type: Readonly<'damage_dealt'>
    sourceId: Readonly<PlayingEntityID>
    targetId: Readonly<PlayingEntityID>
    amount: Readonly<number>
    reactionDepth: Readonly<number>
}

export type DamageSkippedLog = {
    type: Readonly<'damage_skipped'>
    targetId: Readonly<PlayingEntityID>
    reason: Readonly<'target_already_dead' | string>
}

export type EntityDiedLog = {
    type: Readonly<'entity_died'>
    entityId: Readonly<PlayingEntityID>
}

export type ActionFailedLog = {
    type: Readonly<'action_failed'>
    reason: Readonly<string>
}

export type TurnLog = {
    turnIndex: number
    actionLogs: ActionLog[]
}

export type EntityMovedLog = {
    type: Readonly<'entity_moved'>
    entityId: Readonly<PlayingEntityID>
    cell: Readonly<Position>
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


export type PlayingTeamID = "PLAYER" | "ENEMY"
export type PlayingEntityID = string

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
    statuses: Readonly<IStatus[]>
    takeDamage(amount: number): number
    isDead: boolean
}

export type EntityStats = {
    health: number
    energy: number
}

export type FightMapID = string

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
    cells: EObstacleType[][]
    spawnPoints: FightMapSpawnPoints
}

export type MapCell = {
    position: Position,
    type: EObstacleType
}

export type PathfindingParams = {
    context: MovementContext;
    fightContext: FightContext;
}

export type ApplyDamageParams = {
    targetId: PlayingEntityID;
    sourceId: PlayingEntityID;
    amount: number;
    reactionDepth?: number;
}

export type ApplyDamageResult = {
    actualDamage: number;
    isDead: boolean;
}

export type MoveEntityParams = {
    entityId: PlayingEntityID,
    destination: Position
}