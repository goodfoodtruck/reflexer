import { UserRepository } from "@repositories/user.repository"
import { UserRankingRepository } from "@repositories/ranked/userRanking.repository"

export class UserRankingService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly userRankingRepo: UserRankingRepository
    ) {}

    async getRankingByUserId(userId: string) {
        const user = await this.userRepo.findById(userId)
        if (!user) throw Object.assign(new Error("User not found."), { status: 404 })

        const userRanking = await this.userRankingRepo.findByUserId(userId)
        if (!userRanking) throw Object.assign(new Error("User ranking not found."), { status: 404 })

        return {
            user: { id: user.id, name: user.name },
            ranking: userRanking.toObject()
        }
    }
}
