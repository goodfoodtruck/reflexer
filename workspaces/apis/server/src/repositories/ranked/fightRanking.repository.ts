import { FightRankingModel } from "@models/ranked/fight_ranking.model"

type CreateFightRankingData = {
    fightId: string
    userId: string
    opponentId: string
    winnerId: string
    userEloBefore: number
    userEloAfter: number
    opponentEloBefore: number
    opponentEloAfter: number
    eloDeltaUser: number
    eloDeltaOpponent: number
}

export class FightRankingRepository {
    async create(data: CreateFightRankingData) {
        return FightRankingModel.create(data)
    }
}
