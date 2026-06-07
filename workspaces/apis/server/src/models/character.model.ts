import { Schema, model, type Document, type Types } from "mongoose"
import type { AllyName } from "@reflexer/engine"
 
export interface CharacterDocument extends Document {
    userId:    Types.ObjectId
    name:      string
    characterName:  AllyName
    createdAt: Date
    updatedAt: Date
}
 
const CharacterSchema = new Schema<CharacterDocument>(
    {
        userId:        { type: Schema.Types.ObjectId, ref: "User", required: true },
        name:          { type: String, required: true },
        characterName: { type: String, required: true }
    },
    { timestamps: true }
)
 
export const CharacterModel = model<CharacterDocument>("Character", CharacterSchema)
 
