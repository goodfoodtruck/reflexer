import { api } from "./api"
import type { CharacterName } from "@reflexer/engine"

export type Character = {
    _id:       string
    userId:    string
    name:      string
    characterName:  CharacterName
    createdAt: string
    updatedAt: string
}

export const CharacterService = {
    create: (userId: string, name: string, characterName: CharacterName) =>
        api.post<Character>("/allies", { userId, name, characterName }),

    getAllByUser: (userId: string) =>
        api.get<Character[]>(`/allies?userId=${userId}`),

    getById: (id: string) =>
        api.get<Character>(`/allies/${id}`),
}
