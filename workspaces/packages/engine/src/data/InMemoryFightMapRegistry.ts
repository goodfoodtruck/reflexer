import { FightMapID, FightMapConfig } from '@fight/map/fight.map.types'
import { IFightMapRegistry } from './IFightMapRegistry'

export class InMemoryFightMapRegistry implements IFightMapRegistry {
    private readonly maps: ReadonlyMap<FightMapID, FightMapConfig>

    constructor(maps: readonly FightMapConfig[]) {
        const entries: [FightMapID, FightMapConfig][] = maps.map(m => [m.id, m])

        if (entries.length !== new Set(entries.map(([id]) => id)).size) {
            throw new Error('InMemoryFightMapRegistry: duplicate map IDs detected')
        }

        this.maps = new Map(entries)
    }

    getConfig(id: FightMapID): FightMapConfig {
        const config = this.maps.get(id)
        if (!config) {
            throw new Error(`InMemoryFightMapRegistry: map inconnue "${id}"`)
        }
        return config
    }
}