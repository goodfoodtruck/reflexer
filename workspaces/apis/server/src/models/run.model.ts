import { Schema, model, type Document, type Types } from "mongoose"
 
export interface RunDocument extends Document {
    userId:          Types.ObjectId
    teamComposition: string[]
    gold:            number
    floorIndex:      number
    status:          "RUNNING" | "FINISHED"
    createdAt:       Date
    updatedAt:       Date
}
 
const RunSchema = new Schema<RunDocument>(
    {
        userId:          { type: Schema.Types.ObjectId, ref: "User",  required: true },
        teamComposition: { type: [String], default: [] },
        gold:            { type: Number, required: true, default: 0 },
        floorIndex:      { type: Number, required: true, default: 0 },
        status:          { type: String, enum: ["RUNNING", "FINISHED"], default: "RUNNING" }
    },
    { timestamps: true }
)
 
export const RunModel = model<RunDocument>("Run", RunSchema)
 
