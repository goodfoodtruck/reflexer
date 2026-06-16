import { api } from "./api"
import type { Gambit } from "@reflexer/engine";

export type GambitPayload = Omit<Gambit, 'id' | 'name'>;

export type GambitDocument = GambitPayload & {
  id: string;
  name: string;
  characterId: string;
  createdAt: string;
  updatedAt: string;
};

export type GambitsByCharacter = {
    characterId: string
    characterName: string
    gambits: Gambit[]
}

export const GambitService = {
    getUserGambitsByCharacter: (userId: string) => api.get<GambitsByCharacter[]>(`/gambits?userId=${userId}`),

    add: (userId: string, name: string, characterId: string, gambit: GambitPayload) => {
        return api.post<GambitDocument>("/gambits", { userId, name, characterId, ...gambit })
    },

    update: (id: string, gambit: Partial<GambitPayload & { name: string }>) =>
        api.patch<GambitDocument>(`/gambits/${id}`, gambit),

    delete: (id: string) =>
        api.delete<void>(`/gambits/${id}`),
}
