import { Schema, model, type Document, type Types } from "mongoose"
 
export interface RunDocument extends Document {
    userId:          Types.ObjectId
    gold:            number
    floorIndex:      number
    status:          "running" | "finished"
    createdAt:       Date
    updatedAt:       Date
}
 
const RunSchema = new Schema<RunDocument>(
    {
        userId:          { type: Schema.Types.ObjectId, ref: "User",  required: true },
        gold:            { type: Number, required: true, default: 0 },
        floorIndex:      { type: Number, required: true, default: 1 },
        status:          { type: String, enum: ["running", "finished"], default: "running" }
    },
    { timestamps: true }
)
 
export const RunModel = model<RunDocument>("Run", RunSchema)
 
