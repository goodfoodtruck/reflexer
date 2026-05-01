import { PlayingEntity, PlayingEntityID, PlayingTeamID } from "@fight/fight.types"

export interface IFightContextReader {
    isNewTurn(): boolean
    getActingEntity(): PlayingEntity | null
    getAllEntities(): PlayingEntity[]
    getAllies(teamId: PlayingTeamID): PlayingEntity[]
    getEnemies(teamId: PlayingTeamID): PlayingEntity[]
    getEntityById(entityId: PlayingEntityID): PlayingEntity | null
    getTurnIndex(): number
}