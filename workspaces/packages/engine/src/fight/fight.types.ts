import { Gambit, MovementStrategy } from "@fight/gambits/gambits.types"
import { Position } from "@helpers/types/helpers.types"
import { ProcessorConfig } from "@processors/processor.types";
import { EFightMapSize, FightMapID } from "@fight/map/fight.map.types";
import { NbPlayerByTeam } from "@fight/value-objects";
import { ActivePassive, PassiveID } from "@fight/passives/passives.types";
import { FightContext } from "./context/FightContext";
import { FightMap } from "./map";
import { TeamMemberData } from "@game-engine/game-engine.types";

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

export type ExecutionState = {
    computedDamage: number
    computedHeal: number
}

export type MovementContext = {
    readonly casterId: PlayingEntityID
    readonly targetPosition: Position   // position de l'entité dont on doit se rapprocher, fuir...etc
    readonly strategy: MovementStrategy
}

export type ExecutionContext = 
    | MovementExecutionContext
    | ActionExecutionContext

export type MovementExecutionContext = {
    type: "movement"
    casterId: Readonly<PlayingEntityID>
    targetCell: Position                    // cellule cible
}

export type ActionExecutionContext = {
    type: "action"
    casterId: Readonly<PlayingEntityID>;
    actionId: Readonly<ActionID>;
    targetId: Readonly<PlayingEntityID>;
    reactionDepth: Readonly<number>;
};

export type ActionID = string

export type ActionCategory = "attack" | "heal" | "passive";

export type Action = {
    id: Readonly<ActionID>;
    type: Readonly<ActionCategory>;
    processorConfigs: Readonly<ProcessorConfig[]>;
};


/** Modificateur de statistiques pour une entité: 
 * 
 * - Dégats infligés, reçus, réduction de dommages... etc 
 * 
 * Une action peut appliquer un ou plusieurs modificateurs à une entité, 
 * lui permettant ainsi d'augmenter ou de diminuer les dégats reçus, infligés... etc
 * */
export type EntityModifier = 
    | "damageDealtModifier"       // altère les dégâts que cette entité inflige, en pourcentage
    | "damageReductionModifier"   // altère les dégâts que cette entité reçoit, en pourcentage
    | "healReductionModifier"     // altère les soins que cette entité reçoit, en pourcentage
    | "healDealtModifier"         // altère les soins que cette entité effectue, en pourcentage


export type FightLog = 
    | ActionLog
    | TurnStartLog
    | TurnEndLog


export type ActionLog =
    | DamageDealtLog
    | DamageSkippedLog
    | EntityDiedLog
    | ActionFailedLog
    | EntityMovedLog
    | PassiveAppliedLog
    | UpdatedEnergyLog
    | HealDealtLog
    | HealSkippedLog

export type HealDealtLog = {
    type: Readonly<'heal_dealt'>
    sourceId: Readonly<PlayingEntityID>
    targetId: Readonly<PlayingEntityID>
    amount: Readonly<number>
    reactionDepth: Readonly<number>
}

export type UpdatedEnergyLog = {
    type: Readonly<'updated_energy'>
    targetId: Readonly<PlayingEntityID>
    updatedValue: Readonly<number>
    reactionDepth: Readonly<number>
}

export type DamageDealtLog = {
    type: Readonly<'damage_dealt'>
    sourceId: Readonly<PlayingEntityID>
    targetId: Readonly<PlayingEntityID>
    amount: Readonly<number>
    reactionDepth: Readonly<number>
}

export type PassiveAppliedLog = {
    type: Readonly<'passive_applied'>
    targetId: Readonly<PlayingEntityID>
    sourceId: Readonly<PlayingEntityID>
    passiveId: Readonly<PassiveID>
}

export type DamageSkippedLog = {
    type: Readonly<'damage_skipped'>
    targetId: Readonly<PlayingEntityID>
    reason: Readonly<'target_already_dead' | string>
}

export type HealSkippedLog = {
    type: Readonly<'heal_skipped'>
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

export type TurnStartLog = {
    type: Readonly<'turn_start'>
    turnIndex: number
}

export type TurnEndLog = {
    type: Readonly<'turn_end'>
    turnIndex: number
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
    | { status: "ENDED", endState: FightEndState }

export type FightResult = {
    initialState: FightSnapshot
    endState: FightEndState
    logs: TurnLog[]
}

export type FightSnapshot = {
    entities: EntitySnapshot[]
    mapId: FightMapID
}

export type EntitySnapshot = {
    id: PlayingEntityID
    teamId: PlayingTeamID
    tags: EntityTag[]
    position: Position
    currentStats: EntityStats
    passives: PassiveID[]
}

export type FightEndState =
    | "WON"
    | "LOST"
    | { kind: "INTERRUPTED"; reason: "MAX_TURNS_REACHED" | "TURN_LOOP" }


export type PlayingTeamID = "PLAYER" | "ENEMY"
export type PlayingEntityID = string


export type AllyName = "CHARACTER_1" | "CHARACTER_2"

export type EnemyTag = 
    | "ENEMY_MELEE"
    | "ENEMY_RANGED"
    | "ENEMY_TANK"
    | "ENEMY_BOSS"

export type EnemyName = "ALIEN" | "KNIGHT" | "GOBLIN"

/** On indentifie un ennemi par son type et un allié par son nom */
export type EntityTag =
    | AllyName
    | EnemyTag

    

export type PlayingEntity = {
    id: PlayingEntityID
    teamId: PlayingTeamID
    tags: EntityTag[]
    position: Position
    baseStats: Readonly<EntityStats>
    currentStats: EntityStats
    gambits: Gambit[]
    activePassives: ActivePassive[]
    isDead: boolean
}

export type EntityStats = {
    health: number
    energy: number
    armor: number
}


export interface IFightContextReader {
    getMap(): FightMap
    isNewTurn(): boolean
    isEntityDead(entityId: PlayingEntityID): boolean
    getActingEntity(): PlayingEntity | null
    getAllEntities(): PlayingEntity[]
    getAllies(entity: PlayingEntity): PlayingEntity[]
    getEnemies(entity: PlayingEntity): PlayingEntity[]
    getAliveEntitiesByTeam(teamId: PlayingTeamID): PlayingEntity[]
    getEntityById(entityId: PlayingEntityID): PlayingEntity | null
    getAliveEntityOrThrow(entityId: PlayingEntityID): PlayingEntity
    getAffectedEntityId(log: ActionLog): PlayingEntityID | null
    getEntitiesAtPositions(positions: Position[]): PlayingEntity[]
    getModifier(entityId: PlayingEntityID, stat: EntityModifier): number
    getTurnIndex(): number
    toSnapshot(): FightSnapshot
    drainLogs(): ActionLog[]
}

export interface IFightContextMutator {
    nextEntityTurn(): void
    nextTurn(): void
    updateEnergy(params: UpdateEnergyParams): void
    applyHeal(params: ApplyHealParams): void
    applyDamage(params: ApplyDamageParams): void
}

export interface IFightEntitiesValidator {
    validate(entities: PlayingEntity[]): void
}

export interface INbEnemiesResolver {
    resolve(floorIndex: number): NbPlayerByTeam
}

export interface IEnemyBuilder {
    buildEnemy(enemyTag: EnemyTag, position: Position, inTeamOrder: number): PlayingEntity
}

export interface ITeamBuilder {
    buildTeam(members: TeamMemberData[], spawnPositions: Position[], teamId: PlayingTeamID): PlayingEntity[]
}

export interface IEnemyCompositionResolver {
    resolve(mapSize: EFightMapSize, nbEnemies: NbPlayerByTeam): EnemyTag[]
}

export interface IAllyBuilder {
    buildAlly(name: TeamMemberData, position: Position, index: number): PlayingEntity
}

export type FightContextFactoryDeps = {
    validator:                IFightEntitiesValidator
    nbEnemiesResolver:        INbEnemiesResolver
    enemyBuilder:             IEnemyBuilder
    enemyCompositionResolver: IEnemyCompositionResolver
    teamBuilder:              ITeamBuilder
}


export type UpdateEnergyParams = {
    targetId: PlayingEntityID
    updatedEnergyValue: number
    reactionDepth?: number
}

export type AreaType = 
    | { kind: "CIRCLE" } 
    | { kind: "SQUARE" }
    | { kind: "CROSS" }

export type AreaCenter =
    | { kind: "TARGET" }    // centrée sur la cible
    | { kind: "CASTER" }    // centrée sur soi même

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

export type ApplyHealParams = {
    targetId: PlayingEntityID;
    sourceId: PlayingEntityID;
    amount: number;
    reactionDepth?: number;
}

export type MoveEntityParams = {
    entityId: PlayingEntityID,
    destination: Position
}

export enum ERange {
    SHORT = 2,
    MEDIUM = 5,
    LONG = 8
}

export enum EActionRange {
    SHORT = 2,
    MEDIUM = 5,
    LONG = 8,
}