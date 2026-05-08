import { FightMap } from '@fight/FightMap'
import { EObstacleType, FightMapConfig } from '@fight/fight.types'

export function buildFightMap(overrides: Partial<FightMapConfig> = {}): FightMap {
    const dimensions = overrides.dimensions ?? { width: 10, height: 10 };

    const defaultConfig: FightMapConfig = {
        id: "default",
        dimensions,
        cells: new Array(dimensions.height).fill(0).map(_ => new Array(dimensions.width).fill(EObstacleType.FLOOR)),
        spawnPoints: { player: [], enemy: [] }
    }

    return new FightMap({ ...defaultConfig, ...overrides });
}