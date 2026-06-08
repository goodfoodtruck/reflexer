import { Schema, model, type Document, type Types } from "mongoose"
import type { CharacterName, EntityStats } from "@reflexer/engine"
 
export interface CharacterDocument extends Document {
    characterName: CharacterName
    baseStats:     EntityStats
    createdAt:     Date
    updatedAt:     Date
}

const CharacterSchema = new Schema<CharacterDocument>(
    {
        characterName: { type: String, required: true },
        baseStats:     { type: Schema.Types.Mixed, required: true }
    },
    { timestamps: true }
)
 
export const CharacterModel = model<CharacterDocument>("Character", CharacterSchema)
 
