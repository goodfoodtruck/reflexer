import { api } from "./api"
import type { Character } from "./character.service"

export type Team = {
    _id:          string
    userId:       string
    characterIds: Character[]
    createdAt:    string
    updatedAt:    string
}

export const TeamService = {
    getMine: async (): Promise<Team | null> => 
        api.get<Team | null>('/teams/me'),

    save: (characterIds: [string, string]) =>
        api.post<Team>('/teams/me', { characterIds })
}