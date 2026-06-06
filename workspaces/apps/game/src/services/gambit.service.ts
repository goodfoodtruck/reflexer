import { api } from "./api"
import type { Gambit } from "@reflexer/engine"

export type GambitDocument = Omit<Gambit, "id"> & {
    _id:       string
    allyId:    string
    createdAt: string
    updatedAt: string
}

export const GambitService = {
    getAllByAlly: (allyId: string) =>
        api.get<GambitDocument[]>(`/gambits?allyId=${allyId}`),

    add: (allyId: string, gambit: Omit<Gambit, "id">) =>
        api.post<GambitDocument>("/gambits", { allyId, ...gambit }),

    update: (id: string, gambit: Partial<Omit<Gambit, "id">>) =>
        api.patch<GambitDocument>(`/gambits/${id}`, gambit),

    delete: (id: string) =>
        api.delete<void>(`/gambits/${id}`),
}
