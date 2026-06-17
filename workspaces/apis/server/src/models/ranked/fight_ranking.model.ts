import { Schema, Types, model, type Document } from "mongoose"
 
export interface FightRankingDocument extends Document {
    fightId: Types.ObjectId
    userId: Types.ObjectId
    opponentId: Types.ObjectId
    winnerId: Types.ObjectId
    userEloBefore: number
    userEloAfter: number
    opponentEloBefore: number
    opponentEloAfter: number
    eloDeltaUser: number
    eloDeltaOpponent: number
    createdAt: Date
}

const FightRankingSchema = new Schema<FightRankingDocument>(
    {
        fightId:    { type: Schema.Types.ObjectId, ref: 'PvpFight', required: true },
        userId:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
        opponentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        winnerId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },

        userEloBefore: { type: Number, required: true },
        userEloAfter:  { type: Number, required: true },
        eloDeltaUser:  { type: Number, required: true },

        opponentEloBefore: { type: Number, required: true },
        opponentEloAfter:  { type: Number, required: true },
        eloDeltaOpponent:  { type: Number, required: true },
    },
    { timestamps: true }
)
 
export const FightRankingModel = model<FightRankingDocument>("FightRanking", FightRankingSchema)
 
