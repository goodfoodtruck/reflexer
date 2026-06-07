import { api } from "./api"

export type User = {
    _id:       string
    name:      string
    createdAt: string
    updatedAt: string
}

export const UserService = {
    getById: (id: string) =>
        api.get<User>(`/users/${id}`),
}
