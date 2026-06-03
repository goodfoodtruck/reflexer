import { Schema, model, type Document, type Types } from "mongoose"
import type { Gambit } from "@reflexer/engine"
 
export interface GambitDocument extends Omit<Gambit, "id">, Document {
    allyId:    Types.ObjectId
    createdAt: Date
    updatedAt: Date
}
 
const GambitSchema = new Schema<GambitDocument>(
    {
        allyId:         { type: Schema.Types.ObjectId, ref: "Ally", required: true },
        priority:       { type: Number,               required: true },
        conditions:     { type: Schema.Types.Mixed,   required: true },
        targetSelector: { type: Schema.Types.Mixed,   required: true },
        intent:         { type: Schema.Types.Mixed,   required: true }
    },
    { timestamps: true }
)
 
export const GambitModel = model<GambitDocument>("Gambit", GambitSchema)
 
