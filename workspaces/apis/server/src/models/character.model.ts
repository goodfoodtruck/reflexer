import { Schema, model, type Document, type Types } from "mongoose"
import type { EntityStats } from "@reflexer/engine"
 
export interface CharacterDocument extends Document {
    slug:          string // pour le asset
    characterName: string
    description:   string
    baseStats:     EntityStats
    imageUrl:      string
    createdAt:     Date
    updatedAt:     Date
}

const CharacterSchema = new Schema<CharacterDocument>(
    {
        slug:           { type: String, unique: true, sparse: true, trim: true },
        characterName:  { type: String, required: true },
        description:    { type: String, required: true },
        baseStats:      { type: Schema.Types.Mixed, required: true },
        imageUrl:       { type: String, required: true }
    },
    { timestamps: true }
)
 
export const CharacterModel = model<CharacterDocument>("Character", CharacterSchema)
 
