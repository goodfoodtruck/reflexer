import { api } from "./api"
import type { DisplayGambit } from "../components/ui/gambit/GambitTypes"

export type GambitPayload = Omit<DisplayGambit, 'id' | 'name'>;

export type GambitDocument = GambitPayload & {
  _id: string;
  name: string;
  characterId: string;
  createdAt: string;
  updatedAt: string;
};


export const GambitService = {
    getAllByCharacter: (characterId: string) =>
        api.get<GambitDocument[]>(`/gambits?characterId=${characterId}`),

    add: (name: string, characterId: string, gambit: GambitPayload) => {
        // TODO a supprimé une fois l'auth est merge
        // utiliser plutot le token
        const userId = '6a258ffebe19cf55e02872c5'
        return api.post<GambitDocument>("/gambits", { userId, name, characterId, ...gambit })
    },

    update: (id: string, gambit: Partial<GambitPayload & { name: string }>) =>
        api.patch<GambitDocument>(`/gambits/${id}`, gambit),

    delete: (id: string) =>
        api.delete<void>(`/gambits/${id}`),
}
