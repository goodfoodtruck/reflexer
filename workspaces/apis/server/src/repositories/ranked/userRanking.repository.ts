import { UserRankingModel, type UserRankingDocument } from "@models/ranked/user_ranking.model"
import { Types } from "mongoose"

type UpdateAfterFightData = {
    currentElo: number
    highestElo: number
    currentWinstreak: number
    highestWinstreak: number
    won: boolean
}

export class UserRankingRepository {
    async findByUserId(userId: string) {
        return UserRankingModel.findOne({ userId })
    }

    async create(userId: string) {
        return UserRankingModel.create({ userId })
    }

    async findClosestEloOpponent(userId: string, currentElo: number): Promise<UserRankingDocument | null> {
        const userObjectId = new Types.ObjectId(userId)
        const results: UserRankingDocument[] = await UserRankingModel.aggregate([
            { $match: { userId: { $ne: userObjectId } } },
            { $addFields: { eloDistance: { $abs: { $subtract: ["$currentElo", currentElo] } } } },
            { $sort: { eloDistance: 1 } },
            { $limit: 1 }
        ])
        return results[0] ?? null
    }

    async updateAfterFight(userId: string, data: UpdateAfterFightData) {
        return UserRankingModel.updateOne(
            { userId },
            {
                $set: {
                    currentElo: data.currentElo,
                    highestElo: data.highestElo,
                    currentWinstreak: data.currentWinstreak,
                    highestWinstreak: data.highestWinstreak
                },
                $inc: {
                    wins: data.won ? 1 : 0,
                    losses: data.won ? 0 : 1,
                    totalGames: 1
                }
            }
        )
    }
}
