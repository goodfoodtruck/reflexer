import { Schema, model, type Document, type Types } from "mongoose"
import type { AllyName } from "@reflexer/engine"
 
export interface AllyDocument extends Document {
    userId:    Types.ObjectId
    name:      string
    allyName:  AllyName
    createdAt: Date
    updatedAt: Date
}
 
const AllySchema = new Schema<AllyDocument>(
    {
        userId:   { type: Schema.Types.ObjectId, ref: "User", required: true },
        name:     { type: String, required: true },
        allyName: { type: String, required: true }
    },
    { timestamps: true }
)
 
export const AllyModel = model<AllyDocument>("Ally", AllySchema)
 
