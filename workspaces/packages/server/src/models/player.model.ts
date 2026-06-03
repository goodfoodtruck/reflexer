import { Schema, model, type Document } from "mongoose"
import type { AllyName, Gambit } from "@reflexer/engine"
 
type AllySnapshot = {
    allyName: AllyName
    gambits:  Gambit[]
}
 
export interface PlayerDocument extends Document {
    name:            string
    gold:            number
    floorIndex:      number
    teamComposition: AllyName[]
    allies:          AllySnapshot[]
    createdAt:       Date
    updatedAt:       Date
}
 
const AllySnapshotSchema = new Schema<AllySnapshot>(
    {
        allyName: { type: String, required: true },
        gambits:  { type: Schema.Types.Mixed, required: true, default: [] }
    },
    { _id: false }
)
 
const PlayerSchema = new Schema<PlayerDocument>(
    {
        name:            { type: String,   required: true },
        gold:            { type: Number,   required: true, default: 0 },
        floorIndex:      { type: Number,   required: true, default: 1 },
        teamComposition: { type: [String], required: true },
        allies:          { type: [AllySnapshotSchema], required: true, default: [] }
    },
    { timestamps: true }
)
 
export const PlayerModel = model<PlayerDocument>("Player", PlayerSchema)
 
