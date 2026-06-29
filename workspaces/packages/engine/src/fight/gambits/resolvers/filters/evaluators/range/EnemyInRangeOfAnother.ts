import { EnemyInRangeOfAnotherFilter, FilterEvaluator } from "@fight/gambits/resolvers/filters/entityFilters.types"
import { manhattanDistance } from "@helpers/map/utils"

/**
 * Vérifie qu'au moins une paire d'ennemis est à portée l'un de l'autre.
 */
export const evaluateEnemyInRangeOfAnother: FilterEvaluator<EnemyInRangeOfAnotherFilter> = (entity, filter, context): boolean => {
    const enemies = context.fightContext.getEnemies(entity)

    if (enemies.length < 2) return false

    for (let i = 0; i < enemies.length; i++) {
        for (let j = i + 1; j < enemies.length; j++) {
            const distance = manhattanDistance(enemies[i]!.position, enemies[j]!.position)
            if (distance <= filter.range) return true
        }
    }

    return false
}