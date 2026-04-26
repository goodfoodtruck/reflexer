import { FightMap } from '@fight/FightMap'
import { FightMapConfig } from '@fight/fight.types'

export function buildFightMap(overrides: Partial<FightMapConfig> = {}): FightMap {
    return new FightMap({
        dimensions: { width: 10, height: 10 },
        cells: [],
        spawnPoints: { player: [], enemy: [] },
        ...overrides
    })
}