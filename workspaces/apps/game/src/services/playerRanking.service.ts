import type { User } from "@services/user.service"
import { api } from "./api"

export type PlayerRanking = {
    player: User
    currentElo: number
    highestElo: number
    wins:       number
    losses:     number
    totalGames: number
    currentWinstreak: number
    highestWinstreak: number
}


export const PlayerRankingService = {
    getByUserId: (userId: string) => api.get<PlayerRanking>(`/users/ranking/${userId}`)
}