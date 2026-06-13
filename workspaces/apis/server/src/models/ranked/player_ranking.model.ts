import { Schema, Types, model, type Document } from "mongoose"
 
export interface PlayerRankingDocument extends Document {
    playerId: Types.ObjectId
    currentElo: number
    highestElo: number
    wins:       number
    losses:     number
    totalGames: number
    currentWinstreak: number
    highestWinstreak: number
    updatedAt: Date
}

const PlayerRankingSchema = new Schema<PlayerRankingDocument>(
    {
        playerId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
        currentElo: { type: Number, required: true, default: 100 },
        wins:       { type: Number, required: true, default: 0 },
        losses:     { type: Number, required: true, default: 0 },
        totalGames: { type: Number, required: true, default: 0 },
        highestElo: { type: Number, required: true, default: 100 },
        currentWinstreak: { type: Number, required: true, default: 0 },
        highestWinstreak:  { type: Number, required: true, default: 0 }
    },
    { timestamps: true }
)
 
export const PlayerRankingModel = model<PlayerRankingDocument>("PlayerRanking", PlayerRankingSchema)
 
