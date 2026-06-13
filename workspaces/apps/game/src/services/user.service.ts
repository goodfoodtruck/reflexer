import { api } from "./api"

export type User = {
    _id:       string
    name:      string
    createdAt: string
    updatedAt: string
}

export type PlayerSearchResult = {
    _id:  string
    name: string
}

export const UserService = {
    getById: (id: string) => api.get<User>(`/users/${id}`),
    getByIds: (ids: string[]) => api.post<User[]>("/users/batch", { ids }),
    search: (name: string) => api.get<PlayerSearchResult[]>(`/users/search?name=${encodeURIComponent(name)}`),
}
