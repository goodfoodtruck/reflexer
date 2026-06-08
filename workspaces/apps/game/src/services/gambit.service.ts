import { api } from "./api"
import type { Gambit } from "@reflexer/engine"

export type GambitDocument = Omit<Gambit, "id"> & {
    _id:       string
    characterId:    string
    createdAt: string
    updatedAt: string
}

export const GambitService = {
    getAllByCharacter: (characterId: string) =>
        api.get<GambitDocument[]>(`/gambits?characterId=${characterId}`),

    add: (characterId: string, gambit: Omit<Gambit, "id">) =>
        api.post<GambitDocument>("/gambits", { characterId, ...gambit }),

    update: (id: string, gambit: Partial<Omit<Gambit, "id">>) =>
        api.patch<GambitDocument>(`/gambits/${id}`, gambit),

    delete: (id: string) =>
        api.delete<void>(`/gambits/${id}`),
}
