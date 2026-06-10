import type { BasePvpFight } from "@shared/fight.types"
import { api } from "@services/api"

export type RankedFight = BasePvpFight & {
    mode: "RANKED"
    // + données sur le ranking à rajouter
}

export const RankedFightService = {
    getHistory: (userId: string) => api.get<RankedFight[]>(`/fights/history/ranked/${userId}`),
}