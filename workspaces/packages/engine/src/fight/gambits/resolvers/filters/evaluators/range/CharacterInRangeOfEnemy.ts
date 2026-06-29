import { CharacterInRangeOfEnemyFilter, FilterEvaluator } from "@fight/gambits/resolvers/filters/entityFilters.types"
import { manhattanDistance } from "@helpers/map/utils"

/**
 * Vérifie qu'au moins un allié est à portée d'au moins un ennemi.
 * Le scope est défini par l'entité passée — ses alliés vs ses ennemis.
 */
export const evaluateCharacterInRangeOfEnemy: FilterEvaluator<CharacterInRangeOfEnemyFilter> = (entity, filter, context): boolean => {
    const allies = context.fightContext.getAllies(entity)
    const enemies = context.fightContext.getEnemies(entity)

    if (allies.length === 0 || enemies.length === 0) return false

    for (const character of allies) {
        for (const enemy of enemies) {
            const distance = manhattanDistance(character.position, enemy.position)
            if (distance <= filter.range) return true
        }
    }

    return false
}