import { EnemyName, EnemyTag } from '@fight/fight.types'
import { EnemyConfig, IEnemyRegistry } from './IEnemyRegistry'

type EnemyDataEntry = EnemyConfig & { name: EnemyName; tags: EnemyTag[] }
type EnemyStoredEntry = EnemyConfig & { tags: EnemyTag[] }

export class InMemoryEnemyRegistry implements IEnemyRegistry {
    private readonly enemies: ReadonlyMap<EnemyName, EnemyStoredEntry>

    constructor(enemies: readonly EnemyDataEntry[]) {
        const entries = enemies.map(({ name, ...rest }): [EnemyName, EnemyStoredEntry] => [name, rest])

        if (entries.length !== new Set(entries.map(([name]) => name)).size) {
            throw new Error('InMemoryEnemyRegistry: duplicate enemy names detected')
        }

        this.enemies = new Map(entries)
    }

    getExistingEnemies(enemyTag: EnemyTag): EnemyName[] {
        const matches: EnemyName[] = []

        for (const [name, entry] of this.enemies) {
            if (entry.tags.includes(enemyTag)) {
                matches.push(name)
            }
        }

        if (matches.length === 0) {
            throw new Error(`InMemoryEnemyRegistry: aucun ennemi trouvé pour le tag "${enemyTag}"`)
        }

        return matches
    }

    getConfig(enemyName: EnemyName): EnemyConfig {
        const entry = this.enemies.get(enemyName)
        if (!entry) {
            throw new Error(`InMemoryEnemyRegistry: ennemi inconnu "${enemyName}"`)
        }
        const { tags: _tags, ...config } = entry
        return config
    }
}