import { AllyName, IAllyBuilder, PlayingEntity, PlayingEntityID } from "@fight/fight.types"
import { TeamMemberData } from "@game-engine/game-engine.types"
import { Position } from "@helpers/types/helpers.types"

export class AllyBuilder implements IAllyBuilder {

    constructor() {}

    buildAlly(data: TeamMemberData, position: Position, index: number): PlayingEntity {
        return {
            id: this.generateAllyID(data.name, index),
            teamId: "PLAYER",
            tags: [data.name],
            position: position,
            baseStats: { ...data.baseStats },
            currentStats: { ...data.baseStats },
            gambits: [...data.gambits],
            activePassives: [],
            isDead: false
        }
    }
    
    private generateAllyID(allyName: AllyName, index: number): PlayingEntityID {
        return `${allyName}_${index}`
    }
}