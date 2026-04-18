import { PlayingEntityID, PlayingEntity } from "@fight/fight.types"
import { FightMap } from "@fight/FightMap"
import { InitiativeOrderIndex } from "./value-objects/InitiativeOrderIndex"
import { IFightContextReader } from "./context/IFightContextReader"
import { IFightContextMutator } from "./context/IFightContextMutator"

export class FightContext implements IFightContextReader, IFightContextMutator {

    private turnIndex: number
    private entities: Map<PlayingEntityID, PlayingEntity>
    private initiativeOrder: PlayingEntityID[]
    private currentInitiativeIndex: InitiativeOrderIndex
    private readonly map: FightMap

    constructor(entities: PlayingEntity[], map: FightMap) {
        this.turnIndex = 0
        this.map = map
        this.currentInitiativeIndex = new InitiativeOrderIndex(0)
        this.entities = new Map<PlayingEntityID, PlayingEntity>()
        entities.forEach(entity => this.entities.set(entity.id, entity))

        this.initiativeOrder = [...entities].map(entity => entity.id)
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

    getEntityById(entityId: PlayingEntityID): PlayingEntity | null {
        return this.entities.get(entityId) ?? null
    }

    getAliveEntityOrThrow(entityId: PlayingEntityID): PlayingEntity {
        const entity = this.getEntityById(entityId)
        if (! entity || entity.isDead) 
            throw new Error(`Entity ${entityId} not found or dead`)

        return entity
    }

    getTurnIndex(): number {
        return this.turnIndex
    }

    nextTurn(): void {
        this.turnIndex++
    }
}