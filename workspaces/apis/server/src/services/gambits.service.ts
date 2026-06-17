import { CharacterModel } from "@models/character.model"
import { GambitModel } from "@models/gambit.model"
import { CharacterName, Gambit } from "@reflexer/engine"
import type { Types } from "mongoose"

export type GambitsByCharacter = {
    characterId: Types.ObjectId
    characterName: CharacterName
    gambits: Gambit[]
}

export async function getUserGambitsByCharacter(userId: string): Promise<GambitsByCharacter[]> {
    const characters = await CharacterModel.find()

    return Promise.all(
        characters.map(async (character) => {
            const gambits = await GambitModel
                .find({ userId, characterId: character._id })
                .sort({ priority: 1 })
                .lean()                

            return {
                characterId: character._id,
                characterName: character.characterName,
                gambits
            }
        })
    )
}