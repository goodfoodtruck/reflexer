import { api } from "./api"
import type { EnemyName, TurnLog, FightEndState, FightResult, FightMapID } from "@reflexer/engine"

export type Fight = {
    _id:        string
    runId:      string
    enemies:    EnemyName[]
    floorIndex: number
    date:       string
    winner:     "PLAYER" | "ENEMY" | null
    endState:   FightEndState | null
    status:     "running" | "finished"
    createdAt:  string
    updatedAt:  string
}

export type FinishFightInput = {
    winner:   "PLAYER" | "ENEMY"
    endState: FightEndState
    logs:     TurnLog[]
}

export type FriendlyFight = FightResult & {
    _id:            string
    mode:           "RANKED" | "FRIENDLY"
    playerUserId:   string
    opponentUserId: string
    winner:         "PLAYER" | "ENEMY"
    fightMapId:     FightMapID
    createdAt:      string
    updatedAt:      string
}

export const FightService = {
    create: (runId: string, enemies: EnemyName[], floorIndex: number) =>
        api.post<Fight>("/fights", { runId, enemies, floorIndex }),

    getAllByRun: (runId: string) =>
        api.get<Fight[]>(`/fights?runId=${runId}`),

    getById: (id: string) =>
        api.get<Fight>(`/fights/${id}`),

    finish: (id: string, input: FinishFightInput) =>
        api.post<{ fight: Fight; fightLog: { logs: TurnLog[] } }>(`/fights/${id}/finish`, input),

    getLogs: (id: string) =>
        api.get<TurnLog[]>(`/fights/${id}/logs`),

    // Combat amical (PVP) joué côté serveur : renvoie le `fight` étendu, rejouable tel quel.
    playFriendlyFight: (playerId: string, opponentId: string, fightMapId: FightMapID) =>
        api.post<FriendlyFight>("/fights/friendly", { playerId, opponentId, fightMapId }),
}
