import { CharacterModel } from "@models/character.model"
import { GambitModel } from "@models/gambit.model"
import type { Gambit, TeamMemberData } from "@reflexer/engine"

export async function buildTeamFromUserId(userId: string): Promise<TeamMemberData[]> {
    const characters = await CharacterModel.find()    

    return Promise.all(
        characters.map(async (character) => {            
            const gambits = await GambitModel
            .find({ userId, characterId: character._id })
            .sort({ priority: 1 })
            .lean()

            return {
                characterName: character.characterName,
                baseStats: character.baseStats,
                activePassiveIds: [],
                gambits: gambits.map<Gambit>(g => ({
                    ...g,
                    id: g._id.toString()
                }))
            }
        })
    )
}
