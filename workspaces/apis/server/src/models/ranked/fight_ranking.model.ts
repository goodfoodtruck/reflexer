import { Schema, Types, model, type Document } from "mongoose"
 
export interface FightRankingDocument extends Document {
    fightId: Types.ObjectId
    playerId: Types.ObjectId
    opponentId: Types.ObjectId
    winnerId: Types.ObjectId
    playerEloBefore: number
    playerEloAfter: number
    opponentEloBefore: number
    opponentEloAfter: number
    eloDeltaPlayer: number
    eloDeltaOpponent: number
    createdAt: Date
}

const FightRankingSchema = new Schema<FightRankingDocument>(
    {
        fightId:    { type: Schema.Types.ObjectId, ref: 'PvpFight', required: true },
        playerId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
        opponentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        winnerId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },

        playerEloBefore: { type: Number, required: true },
        playerEloAfter:  { type: Number, required: true },
        eloDeltaPlayer: { type: Number, required: true },

        opponentEloBefore: { type: Number, required: true },
        opponentEloAfter:  { type: Number, required: true },
        eloDeltaOpponent: { type: Number, required: true },
    },
    { timestamps: true }
)
 
export const FightRankingModel = model<FightRankingDocument>("FightRanking", FightRankingSchema)
 
