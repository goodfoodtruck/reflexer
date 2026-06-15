import { CharacterModel } from "@models/character.model"
import { GambitModel } from "@models/gambit.model"
import type { Gambit, TeamMemberData } from "@reflexer/engine"

export async function buildTeamFromUserId(userId: string): Promise<TeamMemberData[]> {
    const characters = await CharacterModel.find()

    return Promise.all(
        characters.map(async (character) => {
            const gambits = await GambitModel.find({
                userId,
                characterId: character._id
            }).sort({ priority: 1 })

            return {
                characterName: character.characterName,
                baseStats: character.baseStats,
                activePassiveIds: [],
                gambits: gambits.map<Gambit>(g => ({
                    id: g._id.toString(),
                    name: g.name,
                    priority: g.priority,
                    conditions: g.conditions,
                    targetSelector: g.targetSelector,
                    intent: g.intent
                }))
            }
        })
    )
}
