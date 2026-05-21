import { PlayingEntityID, PlayingEntity, DamageReceivedEvent, ApplyDamageParams, ApplyDamageResult, MoveEntityParams } from "@fight/fight.types"
import { FightMap } from "@fight/FightMap"
import { InitiativeOrderIndex } from "@fight/value-objects/InitiativeOrderIndex"
import { IFightContextMutator } from "./IFightContextMutator"
import { IFightContextReader } from "./IFightContextReader"
import { IReactiveContext } from "@fight/context/IFightContextReactive";
import { QueuedProcessor } from "@processors/processor.types";
import { Position } from "@helpers/types/helpers.types";

export class FightContext implements IFightContextReader, IFightContextMutator, IReactiveContext {

    private turnIndex: number
    private entities: Map<PlayingEntityID, PlayingEntity>
    private initiativeOrder: PlayingEntityID[]
    private currentInitiativeIndex: InitiativeOrderIndex
    private readonly map: FightMap
    private reactionQueue: QueuedProcessor[]

    constructor(entities: PlayingEntity[], map: FightMap) {
        //const validator = new FightEntitiesValidator()
        //validator.validate(entities)

        this.turnIndex = 0
        this.map = map
        this.reactionQueue = []
        this.entities = new Map<PlayingEntityID, PlayingEntity>()
        entities.forEach(entity => this.entities.set(entity.id, entity))

        this.initiativeOrder = this.buildInitiativeOrder(entities)
        this.currentInitiativeIndex = new InitiativeOrderIndex(0, this.initiativeOrder.length)
    }

    private buildInitiativeOrder(entities: PlayingEntity[]): PlayingEntityID[] {
        const initiativeOrder: PlayingEntityID[] = []
        const alliesIds: PlayingEntityID[] = entities.filter(entity => entity.teamId === "PLAYER").map(e => e.id)
        const enemiesIds: PlayingEntityID[] = entities.filter(entity => entity.teamId === "ENEMY").map(e => e.id)

        const max = Math.max(alliesIds.length, enemiesIds.length)
        for(let i = 0; i < max; i++) {
            const allyId = alliesIds[i]
            const enemyId = enemiesIds[i]

            allyId && initiativeOrder.push(allyId)
            enemyId && initiativeOrder.push(enemyId)
        }

        return initiativeOrder
    }

    nextEntityTurn(): void {
        this.currentInitiativeIndex = this.currentInitiativeIndex.next()
    }

    isNewTurn(): boolean {
        return this.currentInitiativeIndex.value === 0
    }

    isEntityDead(entityId: PlayingEntityID): boolean {
        return this.getEntityById(entityId)?.isDead ?? true
    }

    /**
     * 
     * @returns L'entité qui doit jouer son tour, null si toutes les entités sont vaincues
     */
    getActingEntity(): PlayingEntity | null {
        const nbPlayingEntities = this.initiativeOrder.length

        for (let i = 0; i < this.initiativeOrder.length; i++) {
            const index = (this.currentInitiativeIndex.value + i) % nbPlayingEntities
            
            const entityId = this.initiativeOrder[index]
            if (! entityId) 
                continue

            const entity = this.entities.get(entityId)
            if (! entity || entity.isDead)
                continue

            return entity
        }

        return null
    }

    getAllEntities(): PlayingEntity[] {
        return Array.from(this.entities.values())
    }

    getAliveEntities(): PlayingEntity[] {
        return Array.from(this.entities.values()).filter(entity => (! entity.isDead))
    }

    getAllies(entity: PlayingEntity): PlayingEntity[] {
        return this
                .getAliveEntities()
                .filter(e => e.teamId === entity.teamId)
                .filter(e => e.id !== entity.id)
    }

    getEnemies(entity: PlayingEntity): PlayingEntity[] {
        return this.getAliveEntities().filter(e => e.teamId !== entity.teamId)
    }

    getEntityById(entityId: PlayingEntityID): PlayingEntity | null {
        return this.entities.get(entityId) ?? null
    }

    getAliveEntityOrThrow(entityId: PlayingEntityID): PlayingEntity {
        const entity = this.getEntityById(entityId)
        if (! entity || entity.isDead)
            throw new Error(`Entity ${entityId} not found or dead`)

        return entity
    }

    getInitiativeOrder(): PlayingEntityID[] {
        return this.initiativeOrder
    }

    getTurnIndex(): number {
        return this.turnIndex
    }

    nextTurn(): void {
        this.turnIndex++
    }

    queueReaction(r: QueuedProcessor): void { this.reactionQueue.push(r) }

    drainReactions(): QueuedProcessor[] {
        const out = this.reactionQueue
        this.reactionQueue = []
        return out
    }

    applyDamage(params: ApplyDamageParams): ApplyDamageResult {
        const target = this.getAliveEntityOrThrow(params.targetId)
        const actualDamage = target.takeDamage(params.amount)

        const event: DamageReceivedEvent = {
            ownerId: params.targetId,
            attackerId: params.sourceId,
            amount: actualDamage,
            reactionDepth: params.reactionDepth ?? 0,
        }

        for (const status of target.statuses) {
            const reaction = status.onDamageReceived?.(event)
            if (reaction) this.queueReaction(reaction)
        }

        return { actualDamage, isDead: this.isEntityDead(target.id) }
    }

    moveEntity({ entityId, destination }: MoveEntityParams): void {
        const entity = this.getAliveEntityOrThrow(entityId)

        if (this.isCellOccupied(destination)) {
            throw new Error(`La cellule (${destination.x}, ${destination.y}) est déjà occupée`)
        }

        if (!this.map.isWalkable(destination)) {
            throw new Error(`La cellule (${destination.x}, ${destination.y}) n'est pas praticable`)
        }

        entity.position = destination
    }

    private isCellOccupied(position: Position): boolean {
        return [...this.entities.values()].some(e =>
            !e.isDead &&
            e.position.x === position.x &&
            e.position.y === position.y
        )
    }

    public isTraversable(position: Position): boolean {
        if (!this.map.isWalkable(position)) return false;
        if (this.isCellOccupied(position)) return false;
        return true;
    }

    public getObstacles(): Position[] {
        const obstacles: Position[] = [];

        this.getAliveEntities().forEach(entity => {
            obstacles.push(entity.position);
        });

        const { width, height } = this.map.getDimensions();
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const currentPos = { x, y };
                
                if (!this.map.isWalkable(currentPos)) {
                    obstacles.push(currentPos);
                }
            }
        }

        return obstacles;
    }
}