import type { FightMapID } from "@reflexer/engine";
import { api } from "@services/api"
import type { User } from "@services/user.service";
import type { BasePvpFight, FriendlyFight } from "../../shared/types/fight.types"

interface PlayFightPayload {
    playerId: string
    opponentId: string
    fightMapId: FightMapID
}

export type PlayFightResponse = BasePvpFight & {
    playerUser:   User
    opponentUser: User
}

export const FriendlyFightService = {
    getHistory: (userId: string) => api.get<FriendlyFight[]>(`/fights/history/friendly/${userId}`),
    playFight: (payload: PlayFightPayload) => api.post<PlayFightResponse>('/fights/friendly', payload)
}