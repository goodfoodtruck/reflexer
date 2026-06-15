import { Schema, model, type Document, type Types } from "mongoose"
import type { EnemyName, FightEndState, FightSnapshot, PlayingTeamID, TurnLog } from "@reflexer/engine"
 
export interface PveFightDocument extends Document {
    runId:          Types.ObjectId
    enemies:        EnemyName[]
    floorIndex:     number
    winner:         PlayingTeamID
    initialState:   FightSnapshot
    endState:       FightEndState
    logs:           TurnLog[]
    createdAt:      Date
    updatedAt:      Date
}
 
const PveFightSchema = new Schema<PveFightDocument>(
    {
        runId:        { type: Schema.Types.ObjectId, ref: "Run", required: true },
        enemies:      { type: [String], required: true },
        floorIndex:   { type: Number,   required: true },
        winner:       { type: String,   required: true, enum: ["PLAYER", "ENEMY"] },
        endState:     { type: Schema.Types.Mixed, required: true },
        initialState: { type: Schema.Types.Mixed, required: true },
        logs:         { type: Schema.Types.Mixed, required: true, default: [] },
    },
    { timestamps: true }
)
 
export const PveFightModel = model<PveFightDocument>("PveFight", PveFightSchema)
 
