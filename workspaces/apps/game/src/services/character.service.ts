import { api } from "./api"
import type { EntityStats } from "@reflexer/engine"

export type Character = {
    _id:           string
    slug:          string // pour le nommage dans asset (img)
    characterName: string
    description:   string
    baseStats:     EntityStats
    imageUrl:      string
    createdAt:     string
    updatedAt:     string
}

export const CharacterService = {
    getAll: () => api.get<Character[]>('/characters'),
    getById: (id: string) => api.get<Character>(`/characters/${id}`)
}