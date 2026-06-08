import type { Gambit } from '@reflexer/engine';
import { api } from './api';

export type Character = {
  _id: string;
  userId: string;
  name: string;
  characterName: string;
};

export type GambitDocument = Gambit & {
  _id: string;
  allyId: string;
};

export type FightResult = {
  _id: string;
  winner: 'PLAYER' | 'ENEMY';
  mode: string;
};

export const ChallengeService = {
  sendNotification: (opponentId: string) =>
    api.post(`/users/notifications/test`, { opponentId }),

  getMyCharacters: (userId: string) => api.get<Character[]>(`/characters?userId=${userId}`),

  getCharacterGambits: (allyId: string) => api.get<GambitDocument[]>(`/gambits?allyId=${allyId}`),

  getOpponentCharacters: (userId: string) => api.get<Character[]>(`/characters?userId=${userId}`),

  launchFight: (payload: {
    playerId: string;
    opponentId: string;
    fightMapId: string;
    playerTeam: unknown[];
    opponentTeam: unknown[];
  }) => api.post<FightResult>('/fights/friendly', payload)
};
