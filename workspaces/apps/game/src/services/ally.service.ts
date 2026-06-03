import { api } from "./api"
import type { AllyName } from "@reflexer/engine"

export type Ally = {
    _id:       string
    userId:    string
    name:      string
    allyName:  AllyName
    createdAt: string
    updatedAt: string
}

export const AllyService = {
    create: (userId: string, name: string, allyName: AllyName) =>
        api.post<Ally>("/allies", { userId, name, allyName }),

    getAllByUser: (userId: string) =>
        api.get<Ally[]>(`/allies?userId=${userId}`),

    getById: (id: string) =>
        api.get<Ally>(`/allies/${id}`),
}
