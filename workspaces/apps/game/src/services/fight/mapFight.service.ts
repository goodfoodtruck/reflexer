import { api } from '@services/api'

export type FightMapPreview = {
    id: string
    name: string
    thumbnail: string | null
}

export const MapService = {
    getMaps: () => api.get<FightMapPreview[]>('/fights/maps'),
}
