import type { BasePvpFight, RankedFight } from "../../shared/types/fight.types"
import { api } from "@services/api"
import type { AuthUser } from "@hooks/useAuth"

export type RankedUser = {
    user: AuthUser
    ranking: {
        eloBefore: number
        eloAfter: number
        eloDelta: number
        won: boolean
    }
}

export type FightRankingData = {
    fightId:           string
    userId:            string
    opponentId:        string
    winnerId:          string
    userEloBefore:     number
    userEloAfter:      number
    opponentEloBefore: number
    opponentEloAfter:  number
    eloDeltaUser:      number
    eloDeltaOpponent:  number
}

export type PlayRankedFightResponse = BasePvpFight & {
    player: RankedUser
    opponent: RankedUser
    fightRankingData: FightRankingData
}

export type FightRanking = {
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

export const RankedFightService = {
    findAndPlayMatch: (userId: string) => api.post<PlayRankedFightResponse>("/fights/ranked", { userId }),
    getHistory: (userId: string) => api.get<RankedFight[]>(`/fights/history/ranked/${userId}`)
}