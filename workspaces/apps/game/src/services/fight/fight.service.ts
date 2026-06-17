import { api } from "@services/api";
import type { BasePvpFight } from "../../shared/types/fight.types";

export const FightService = {
    getById: (fightId: string) => api.get<BasePvpFight>(`/fights/${fightId}`)
}