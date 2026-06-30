import { UserRepository } from "@repositories/user.repository"
import { UserRankingRepository } from "@repositories/ranked/userRanking.repository"
import { AppError } from "../errors/AppError"

export class UserRankingService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly userRankingRepo: UserRankingRepository
    ) {}

    async getRankingByUserId(userId: string) {
        const user = await this.userRepo.findById(userId)
        if (!user) throw new AppError(404, "USER_NOT_FOUND", "Utilisateur introuvable.")

        const userRanking = await this.userRankingRepo.findByUserId(userId)
        if (!userRanking) throw new AppError(404, "USER_RANKING_NOT_FOUND", "Données de classement introuvables.")

        return {
            user: { id: user.id, name: user.name },
            ranking: userRanking.toObject()
        }
    }
}
