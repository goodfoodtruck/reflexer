import { Schema, model, type Document } from "mongoose"
 
export interface UserDocument extends Document {
    name: string
    password: string
    secretAnswer: string
    createdAt: Date
    updatedAt: Date
}

const UserSchema = new Schema<UserDocument>(
    {
        name: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true },
        secretAnswer: { type: String, required: true },
    },
    { timestamps: true }
)
 
export const UserModel = model<UserDocument>("User", UserSchema)
 
