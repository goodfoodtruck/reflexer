import { api } from "./api"

export type Run = {
    _id:             string
    userId:          string
    teamComposition: string[]  // characterIds
    gold:            number
    floorIndex:      number
    status:          "running" | "finished"
    createdAt:       string
    updatedAt:       string
}

export type UpdateRunInput = {
    gold?:       number
    floorIndex?: number
    status?:     "running" | "finished"
}

export const RunService = {
    create: (userId: string, teamComposition: string[]) =>
        api.post<Run>("/runs", { userId, teamComposition }),

    getAllByUser: (userId: string) =>
        api.get<Run[]>(`/runs?userId=${userId}`),

    getById: (id: string) =>
        api.get<Run>(`/runs/${id}`),
}
