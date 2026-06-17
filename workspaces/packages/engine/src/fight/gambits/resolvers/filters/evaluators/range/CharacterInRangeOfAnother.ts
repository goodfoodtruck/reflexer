import { CharacterInRangeOfAnotherFilter, FilterEvaluator } from "@fight/gambits/resolvers/filters/entityFilters.types"
import { manhattanDistance } from "@helpers/map/utils"

/**
 * Vérifie qu'au moins une paire d'alliés est à portée l'un de l'autre.
 * Le scope des alliés est défini par l'entité passée — ses alliés sont 
 * les entités de sa team (excluant elle-même).
 */
export const evaluateCharacterInRangeOfAnother: FilterEvaluator<CharacterInRangeOfAnotherFilter> = (entity, filter, context): boolean => {
    const allies = context.fightContext.getAllies(entity)

    if (allies.length < 2) return false

    for (let i = 0; i < allies.length; i++) {
        for (let j = i + 1; j < allies.length; j++) {
            const distance = manhattanDistance(allies[i]!.position, allies[j]!.position)
            if (distance <= filter.range) return true
        }
    }

    return false
}