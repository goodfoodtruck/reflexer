import { PlayingEntity, PlayingEntityID } from "@fight/fight.types"

export interface IFightContextReader {
    isNewTurn(): boolean
    getActingEntity(): PlayingEntity | null
    getAllEntities(): PlayingEntity[]
    getEntityById(entityId: PlayingEntityID): PlayingEntity | null
    getTurnIndex(): number
}