import { FightMapConfig, EObstacleType, EFightMapSize } from '@fight/map/fight.map.types';
import { FightMap } from '@fight/map/FightMap'

export function buildFightMap(overrides: Partial<FightMapConfig> = {}): FightMap {
    const dimensions = overrides.dimensions ?? { width: 10, height: 10 };

    const defaultConfig: FightMapConfig = {
        id: "default",
        name: "Default",
        size: EFightMapSize.LONG_RANGE,
        dimensions,
        cells: new Array(dimensions.height).fill(0).map(_ => new Array(dimensions.width).fill(EObstacleType.FLOOR)),
        spawnPoints: { player: [], enemy: [] }
    }

    return new FightMap({ ...defaultConfig, ...overrides });
}