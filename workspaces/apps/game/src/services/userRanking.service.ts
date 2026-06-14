import { api } from "./api"
import type { AuthUser } from "@hooks/useAuth"

export type UserRanking = {
    currentElo: number
    highestElo: number
    wins:       number
    losses:     number
    totalGames: number
    currentWinstreak: number
    highestWinstreak: number
}

export type UserRankingResponse = {
    user: AuthUser
    ranking: UserRanking
}

export type LeaderboardResponse = {}

export const UserRankingService = {
    getByUserId: (userId: string) => api.get<UserRankingResponse>(`/users/ranking/${userId}`),
    getLeaderboard: (userId: string) => api.get<LeaderboardResponse>(`/users/${userId}/ranking/leaderboard`)
}