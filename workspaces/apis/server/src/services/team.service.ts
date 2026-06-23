import { type CharacterDocument } from "@models/character.model"
import { GambitModel } from "@models/gambit.model"
import { TeamModel } from "@models/team.model"
import type { Gambit, TeamMemberData } from "@reflexer/engine"

export async function buildTeamFromUserId(userId: string): Promise<TeamMemberData[]> {
    const team = await TeamModel.findOne({ userId }).populate("characterIds")
    if (!team) return []

    const characters = team.characterIds as unknown as CharacterDocument[]

    return Promise.all(
        characters.map(async (character) => {            
            const gambits = await GambitModel
            .find({ userId, characterId: character._id })
            .sort({ priority: 1 })
            .lean()

            return {
                characterName: character.characterName,
                characterTag: character.slug,
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
