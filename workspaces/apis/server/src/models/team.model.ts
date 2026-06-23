import { Schema, model, type Document, type Types } from "mongoose"

export interface TeamDocument extends Document {
    userId:       Types.ObjectId
    characterIds: Types.ObjectId[]
    createdAt:    Date
    updatedAt:    Date
}

const TeamSchema = new Schema<TeamDocument>(
    {
        userId: {
            type:     Schema.Types.ObjectId,
            ref:      "User",
            required: true,
            unique:   true
        },
        characterIds: {
            type:     [Schema.Types.ObjectId],
            ref:      "Character",
            required: true,
            validate: {
                validator: (ids: Types.ObjectId[]) => ids.length === 2,
                message:   "Une équipe doit contenir exactement 2 personnages"
            }
        }
    },
    { timestamps: true }
)

export const TeamModel = model<TeamDocument>("Team", TeamSchema)