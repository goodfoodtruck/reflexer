import { EnemyInRangeOfCharacterFilter, FilterEvaluator } from "@fight/gambits/resolvers/filters/entityFilters.types"
import { manhattanDistance } from "@helpers/map/utils"

/**
 * Vérifie qu'au moins un ennemi est à portée d'au moins un de mes alliés.
 * Le scope est défini par l'entité passée.
 */
export const evaluateEnemyInRangeOfCharacter: FilterEvaluator<EnemyInRangeOfCharacterFilter> = (entity, filter, context): boolean => {
    const allies = context.fightContext.getAllies(entity)
    const enemies = context.fightContext.getEnemies(entity)

    if (allies.length === 0 || enemies.length === 0) return false

    for (const enemy of enemies) {
        for (const ally of allies) {
            const distance = manhattanDistance(enemy.position, ally.position)
            if (distance <= filter.range) return true
        }
    }

    return false
}