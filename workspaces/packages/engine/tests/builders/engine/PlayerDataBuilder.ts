import { RunPlayerData } from "@game-engine/game-engine.types";

export const buildPlayerData = (overrides: Partial<RunPlayerData> = {}): RunPlayerData => ({
    playerFloorIndex: 0,
    gold: 0,
    ...overrides
})
