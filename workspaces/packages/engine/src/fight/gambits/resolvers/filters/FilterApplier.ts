import { PlayingEntity } from "@fight/fight.types"
import { AnyFilter, FilterEvaluationContext } from "@fight/gambits/resolvers/filters/entityFilters.types"
import { evaluateHpBelow } from "@fight/gambits/resolvers/filters/evaluators/hp/HpBelowEvaluator"
import { evaluateHpAbove } from "@fight/gambits/resolvers/filters/evaluators/hp/HpAboveEvaluator"
import { evaluateHasPassive } from "@fight/gambits/resolvers/filters/evaluators/passive/HasPassiveEvaluator"
import { evaluateInRange } from "@fight/gambits/resolvers/filters/evaluators/range/InRangeEvaluator"
import { FilterEvaluatorRegistry } from "@fight/gambits"
import { evaluateArmorAbove } from "@fight/gambits/resolvers/filters/evaluators/armor/ArmorAboveEvaluator"
import { evaluateArmorBelow } from "@fight/gambits/resolvers/filters/evaluators/armor/ArmorBelowEvaluator"
import { evaluateEnergyAbove } from "@fight/gambits/resolvers/filters/evaluators/energy/EnergyAboveEvaluator"
import { evaluateEnergyBelow } from "@fight/gambits/resolvers/filters/evaluators/energy/EnergyBelowEvaluator"
import { evaluateCharacterInRangeOfAnother } from "@fight/gambits/resolvers/filters/evaluators/range/CharacterInRangeOfAnother"
import { evaluateCharacterInRangeOfEnemy } from "@fight/gambits/resolvers/filters/evaluators/range/CharacterInRangeOfEnemy"
import { evaluateEnemyInRangeOfAnother } from "@fight/gambits/resolvers/filters/evaluators/range/EnemyInRangeOfAnother"
import { evaluateEnemyInRangeOfCharacter } from "@fight/gambits/resolvers/filters/evaluators/range/EnemyInRangeOfCharacter"

export class FilterApplier {

    constructor(
        private readonly filterEvaluatorRegistry: FilterEvaluatorRegistry
    ) {}

    /**
     * Permet de calculer, pour une liste d'entités, celles qui matchent
     * avec les critères passés en paramètres
     * @param entities 
     * @param filters 
     * @param context 
     * @returns
     */
    applyAll(
        entities: PlayingEntity[], 
        filters: AnyFilter[], 
        context: FilterEvaluationContext
    ): PlayingEntity[] {        
        return entities.filter(entity =>
            filters.every(filter => this.evaluate(entity, filter, context))
        )
    }

    /**
     * Evalue si l'entité valide le critère passé en paramètre.
     * 
     * Jette une erreur si aucune fonction de type FilterEvaluator<T> n'a été enregistré
     * pour ce type de critère.
     * @param entity L'entité concernée
     * @param filterType Le type de critère
     * @param context Le contexte, dont les données seront utilisées pour vérifier ce critère
     * @returns true si l'entité valide le critère, false sinon
     */
    private evaluate(
        entity: PlayingEntity, 
        filter: AnyFilter, 
        context: FilterEvaluationContext
    ): boolean {
        const evaluator = this.filterEvaluatorRegistry.getEvaluator(filter.type)
        if (! evaluator) 
            throw new Error(`Filtre ${filter.type} non enregistré`)
        return evaluator(entity, filter, context)
    }
}

export const buildFilterRegistry = (): FilterEvaluatorRegistry => {
    const registry = new FilterEvaluatorRegistry()

    registry.register("HP_BELOW",   evaluateHpBelow)
    registry.register("HP_ABOVE",   evaluateHpAbove)

    registry.register("ARMOR_BELOW",   evaluateArmorBelow)
    registry.register("ARMOR_ABOVE",   evaluateArmorAbove)

    registry.register("ENERGY_BELOW",   evaluateEnergyBelow)
    registry.register("ENERGY_ABOVE",   evaluateEnergyAbove)

    registry.register("HAS_PASSIVE", evaluateHasPassive)

    registry.register("IN_RANGE",    evaluateInRange)

    registry.register("CHARACTER_IN_RANGE_OF_ANOTHER", evaluateCharacterInRangeOfAnother)
    registry.register("CHARACTER_IN_RANGE_OF_ENEMY", evaluateCharacterInRangeOfEnemy)

    registry.register("ENEMY_IN_RANGE_OF_ANOTHER", evaluateEnemyInRangeOfAnother)
    registry.register("ENEMY_IN_RANGE_OF_CHARACTER", evaluateEnemyInRangeOfCharacter)

    return registry
}