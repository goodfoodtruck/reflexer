import { PlayerData } from "@game-engine/game-engine.types";

export const buildPlayerData = (overrides: Partial<PlayerData> = {}): PlayerData => ({
    playerFloorIndex: 0,
    gold: 0,
    ...overrides
})
