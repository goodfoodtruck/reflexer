import { AllyName } from '@fight/fight.types'
import { AllyConfig, IAllyRegistry } from './IAllyRegistry'

export class InMemoryAllyRegistry implements IAllyRegistry {
    private readonly allies: ReadonlyMap<AllyName, AllyConfig>

    constructor(allies: readonly (AllyConfig & { name: AllyName })[]) {
        const entries: [AllyName, AllyConfig][] = allies.map(({ name, ...config }) => [name, config])

        if (entries.length !== new Set(entries.map(([name]) => name)).size) {
            throw new Error('InMemoryAllyRegistry: duplicate ally names detected')
        }

        this.allies = new Map(entries)
    }

    getConfig(allyName: AllyName): AllyConfig {
        const config = this.allies.get(allyName)
        if (!config) {
            throw new Error(`InMemoryAllyRegistry: allié inconnu "${allyName}"`)
        }
        return config
    }
}