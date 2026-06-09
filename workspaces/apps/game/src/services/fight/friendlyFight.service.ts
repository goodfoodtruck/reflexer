import type { FightMapID } from "@reflexer/engine";
import { api } from "@services/api"
import type { BasePvpFight } from "@shared/fight.types"

export type FriendlyFight = BasePvpFight & { mode: "FRIENDLY" }

interface PlayFightPayload {
    playerId: string
    opponentId: string
    fightMapId: FightMapID
}

export const FriendlyFightService = {
    getHistory: (userId: string) => api.get<FriendlyFight[]>(`/fights/friendly/history/${userId}`),
    playFight: (payload: PlayFightPayload) => api.post<BasePvpFight>('/fights/friendly', payload)
}