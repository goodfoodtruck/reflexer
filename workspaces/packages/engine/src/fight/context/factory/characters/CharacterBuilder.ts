import { CharacterName, ICharacterBuilder, PlayingEntity, PlayingEntityID } from "@fight/fight.types"
import { TeamMemberData } from "@game-engine/game-engine.types"
import { Position } from "@helpers/types/helpers.types"

export class CharacterBuilder implements ICharacterBuilder {

    constructor() {}

    buildCharacter(data: TeamMemberData, position: Position, index: number): PlayingEntity {
        return {
            id: this.generateCharacterID(data.characterName, index),
            teamId: "PLAYER",
            tags: [data.characterName],
            position: position,
            baseStats: { ...data.baseStats },
            currentStats: { ...data.baseStats },
            gambits: [...data.gambits],
            activePassives: [],
            isDead: false
        }
    }
    
    private generateCharacterID(characterName: CharacterName, index: number): PlayingEntityID {
        return `${characterName}_${index}`
    }
}