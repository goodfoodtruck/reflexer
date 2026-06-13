import type { BasePvpFight, RankedFight } from "@shared/fight.types"
import { api } from "@services/api"
import type { User } from "@services/user.service"

export type RankedPlayer = {
    user: User
    ranking: {
        eloBefore: number
        eloAfter: number
        eloDelta: number
        won: boolean
    }
}

export type PlayRankedFightResponse = BasePvpFight & {
    player: RankedPlayer
    opponent: RankedPlayer
}

export const RankedFightService = {
    findAndPlayMatch: (userId: string) => api.post<PlayRankedFightResponse>("/fights/ranked", { playerId: userId }),
    getHistory: (userId: string) => api.get<RankedFight[]>(`/fights/history/ranked/${userId}`)
}