import {
    PlayingEntityID,
    PlayingEntity,
    IFightContextMutator,
    IFightContextReader,
    PlayingTeamID,
    FightSnapshot,
    ActionLog,
    EntityModifier
} from "@fight/fight.types"
import { FightMap } from "@fight/map/FightMap"
import { InitiativeOrderIndex } from "@fight/value-objects/InitiativeOrderIndex"
import { Position } from "@helpers/types/helpers.types";
import { ActivePassive, ModifierPassive } from "@fight/passives/passives.types"

export class FightContext implements IFightContextReader, IFightContextMutator {

    private turnIndex: number
    private entities: Map<PlayingEntityID, PlayingEntity>
    private initiativeOrder: PlayingEntityID[]
    private currentInitiativeIndex: InitiativeOrderIndex
    private readonly map: FightMap
    private fightLogs: ActionLog[]

    constructor(entities: PlayingEntity[], map: FightMap) {
        this.turnIndex = 0
        this.map = map
        this.fightLogs = []
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

    /**
     * Augmente l'index de référence de l'entité courante, au prochain appel de 
     * getActingEntity() on récupèrera donc la prochaine entité
     */
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

    getAliveEntitiesByTeam(teamId: PlayingTeamID): PlayingEntity[] {
        return this
                .getAliveEntities()
                .filter(e => e.teamId === teamId)
                .filter(e => (! e.isDead))
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

    toSnapshot(): FightSnapshot {
        return {
            mapId: this.map.id,
            entities: Array.from(this.entities.values()).map(e => ({
                id: e.id,
                teamId: e.teamId,
                tags: [...e.tags],
                position: { ...e.position },
                currentStats: { ...e.currentStats },
                statuses: e.statuses.map(s => s.id)
            }))
        }
    }

    nextTurn(): void {
        this.turnIndex++
    }

    queueLog(l: ActionLog): void { this.fightLogs.push(l) }

    drainLogs(): ActionLog[] {
        const out = this.fightLogs
        this.fightLogs = []
        return out
    }

    applyDamage(params: ApplyDamageParams): ApplyDamageResult {
        const target = this.getAliveEntityOrThrow(params.targetId)
        let actualDamage = params.amount

        if (actualDamage >= target.currentStats.health) {
            actualDamage = target.currentStats.health // montant des dégats reçus = nombre de pv restants de la cible
            target.isDead = true
            target.currentStats.health = 0
        }
        else target.currentStats.health -= actualDamage

        this.queueLog({ 
            type: "damage_dealt", 
            targetId: params.targetId, 
            sourceId: params.sourceId, 
            amount: actualDamage,
            reactionDepth: params.reactionDepth ?? 0
        })

        target.isDead && this.queueLog({ type: "entity_died", entityId: target.id })
        
        return { actualDamage, isDead: target.isDead }
    }

    applyPassive(entityId: PlayingEntityID, newPassive: ActivePassive): void {
        const strategy = newPassive.passive.config.applicationStrategy
        const entity = this.getAliveEntityOrThrow(entityId)

        switch (strategy.type) {
            case "RESET": this.applyResetStrategy(entity, newPassive); break
            case "STACK": this.applyStackStrategy(entity, newPassive, strategy.maxStack); break
        }
    }

    private applyResetStrategy(entity: PlayingEntity, activePassiveToApply: ActivePassive): void {
        const existing = entity.activePassives.find(p => p.passive.id === activePassiveToApply.passive.id)

        if (existing)
            existing.remainingTurns = activePassiveToApply.remainingTurns
        else 
            entity.activePassives.push(activePassiveToApply)
    }

    private applyStackStrategy(
        entity: PlayingEntity, 
        activePassiveToApply: ActivePassive, 
        maxStack: number
    ): void {
        const currentStackCount = entity.activePassives
            .filter(p => p.passive.id === activePassiveToApply.passive.id)
            .length

        if (currentStackCount >= maxStack) return  // ignoré si maxStack atteint

        entity.activePassives.push(activePassiveToApply)
    }

    /**
     * Récupérer le % de modification appliqué sur une statistique
     * en particulier pour une entité. Par exemple si l'entité a deux passifs
     * qui augmentent de 15 et 20% la stat, on retournera 35.
     * @param entityId 
     * @param stat 
     * @returns 
     */
    getModifier(entityId: PlayingEntityID, stat: EntityModifier): number {
        const entity = this.getEntityById(entityId)
        if (! entity) return 0

        return entity.activePassives
            .map(ap => ap.passive)
            .filter((p): p is ModifierPassive => p.kind === "MODIFIER" && p.modifier === stat)
            .reduce((acc, p) => acc + p.value, 0)
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

    tickAllPassives(): void {
        for (const entity of this.getAliveEntities()) {
            entity.activePassives = entity.activePassives
                .map(this.decrementPassive)
                .filter(this.isPassiveStillActive)
        }
    }

    private decrementPassive(passive: ActivePassive): ActivePassive {
        if (passive.remainingTurns === "PERMANENT") return passive
        return { ...passive, remainingTurns: passive.remainingTurns - 1 }
    }

    private isPassiveStillActive(passive: ActivePassive): boolean {
        return passive.remainingTurns === "PERMANENT" || passive.remainingTurns > 0
    }

    getAffectedEntityId(log: ActionLog): PlayingEntityID {
        switch (log.type) {
            case "damage_dealt": return log.targetId
            case "entity_died": return log.entityId
            
            default: throw new Error("Not implemented.")
        }
    }
}

type ApplyDamageParams = {
    targetId: PlayingEntityID;
    sourceId: PlayingEntityID;
    amount: number;
    reactionDepth?: number;
}

type ApplyDamageResult = {
    actualDamage: number;
    isDead: boolean;
}

type MoveEntityParams = {
    entityId: PlayingEntityID,
    destination: Position
}