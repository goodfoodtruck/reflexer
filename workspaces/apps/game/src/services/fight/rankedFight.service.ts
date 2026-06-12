import type { RankedFight } from "@shared/fight.types"
import { api } from "@services/api"

export const RankedFightService = {
    getHistory: (userId: string) => api.get<RankedFight[]>(`/fights/history/ranked/${userId}`),
}