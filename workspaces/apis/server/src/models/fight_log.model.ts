import { Schema, model, type Document, type Types } from "mongoose"
import type { TurnLog } from "@reflexer/engine"
 
export interface FightLogDocument extends Document {
    fightId:   Types.ObjectId
    logs:      TurnLog[]
    createdAt: Date
}
 
const FightLogSchema = new Schema<FightLogDocument>(
    {
        fightId:   { type: Schema.Types.ObjectId, ref: "Fight", required: true },
        logs:      { type: Schema.Types.Mixed, required: true, default: [] }
    },
    { timestamps: true }
)
 
export const FightLogModel = model<FightLogDocument>("FightLog", FightLogSchema)
 
