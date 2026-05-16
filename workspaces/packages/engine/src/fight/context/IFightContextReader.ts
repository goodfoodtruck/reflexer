import { PlayingEntity, PlayingEntityID } from "@fight/fight.types"

export interface IFightContextReader {
    isNewTurn(): boolean
    isEntityDead(entityId: PlayingEntityID): boolean
    getActingEntity(): PlayingEntity | null
    getAllEntities(): PlayingEntity[]
    getAllies(entity: PlayingEntity): PlayingEntity[]
    getEnemies(entity: PlayingEntity): PlayingEntity[]
    getEntityById(entityId: PlayingEntityID): PlayingEntity | null
    getTurnIndex(): number
}