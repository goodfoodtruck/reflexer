import { CharacterModel } from "@models/character.model"
import { GambitModel, type GambitDocument } from "@models/gambit.model"
import type { Types } from "mongoose"

export type GambitsByCharacter = {
    characterId: Types.ObjectId
    characterName: string
    gambits: GambitDocument[]
}

export async function getUserGambitsByCharacter(userId: string): Promise<GambitsByCharacter[]> {
    const characters = await CharacterModel.find()

    return Promise.all(
        characters.map(async (character) => {
            const gambits = await GambitModel
                .find({ userId, characterId: character._id })
                .sort({ priority: 1 })

            return {
                characterId: character._id,
                characterName: character.characterName,
                gambits
            }
        })
    )
}