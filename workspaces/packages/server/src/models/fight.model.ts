import { Schema, model, type Document, type Types } from "mongoose"
import type { EnemyName, FightEndState } from "@reflexer/engine"
 
export interface FightDocument extends Document {
    runId:      Types.ObjectId
    enemies:    EnemyName[]
    floorIndex: number
    date:       Date
    winner:     "PLAYER" | "ENEMY" | null
    endState:   FightEndState | null
    status:     "running" | "finished"
    createdAt:  Date
    updatedAt:  Date
}
 
const FightSchema = new Schema<FightDocument>(
    {
        runId:      { type: Schema.Types.ObjectId, ref: "Run", required: true },
        enemies:    { type: [String], required: true },
        floorIndex: { type: Number,  required: true },
        date:       { type: Date,    required: true, default: () => new Date() },
        winner:     { type: String,  enum: ["PLAYER", "ENEMY"], default: null },
        endState:   { type: Schema.Types.Mixed, default: null },
        status:     { type: String,  enum: ["running", "finished"], default: "running" }
    },
    { timestamps: true }
)
 
export const FightModel = model<FightDocument>("Fight", FightSchema)
 
