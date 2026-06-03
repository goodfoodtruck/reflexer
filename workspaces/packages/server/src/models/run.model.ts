import { Schema, model, type Document, type Types } from "mongoose"
import type { AllyName } from "@reflexer/engine"
 
export interface RunDocument extends Document {
    userId:          Types.ObjectId
    teamComposition: Types.ObjectId[]  // allyIds choisis pour cette run
    gold:            number
    floorIndex:      number
    status:          "running" | "finished"
    createdAt:       Date
    updatedAt:       Date
}
 
const RunSchema = new Schema<RunDocument>(
    {
        userId:          { type: Schema.Types.ObjectId, ref: "User",  required: true },
        teamComposition: { type: [Schema.Types.ObjectId], ref: "Ally", required: true },
        gold:            { type: Number, required: true, default: 0 },
        floorIndex:      { type: Number, required: true, default: 1 },
        status:          { type: String, enum: ["running", "finished"], default: "running" }
    },
    { timestamps: true }
)
 
export const RunModel = model<RunDocument>("Run", RunSchema)
 
