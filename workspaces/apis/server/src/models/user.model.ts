import { Schema, model, type Document } from "mongoose"
 
export interface UserDocument extends Document {
    name:      string
    createdAt: Date
    updatedAt: Date
}
 
const UserSchema = new Schema<UserDocument>(
    {
        name: { type: String, required: true }
    },
    { timestamps: true }
)
 
export const UserModel = model<UserDocument>("User", UserSchema)
 
