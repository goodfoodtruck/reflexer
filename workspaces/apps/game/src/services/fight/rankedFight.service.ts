import type { BasePvpFight, RankedFight } from "@shared/fight.types"
import { api } from "@services/api"
import type { User } from "@services/user.service"

export type PlayRankedFightResponse = BasePvpFight & {
    playerUser:   User
    opponentUser: User
    // + données ranked
}

export const RankedFightService = {
    findAndPlayMatch: (userId: string) => api.post<PlayRankedFightResponse>("/fights/ranked", { playerId: userId }),
    getHistory: (userId: string) => api.get<RankedFight[]>(`/fights/history/ranked/${userId}`)
}