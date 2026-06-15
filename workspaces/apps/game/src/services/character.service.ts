import { api } from "./api"
import type { CharacterName, EntityStats } from "@reflexer/engine"

export type Character = {
    _id:       string
    userId:    string
    name:      string
    baseStats: EntityStats;
    characterName:  CharacterName
    createdAt: string
    updatedAt: string
}

export const CharacterService = {
    getAll: () => api.get<Character[]>('/characters'),

    getById: (id: string) => api.get<Character>(`/characters/${id}`)
}
