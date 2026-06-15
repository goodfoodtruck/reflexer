import { PlayingEntity } from "@fight/fight.types"
import { AnyFilter, FilterEvaluationContext } from "@fight/gambits/resolvers/filters/entityFilters.types"
import { evaluateHpBelow } from "@fight/gambits/resolvers/filters/evaluators/HpBelowEvaluator"
import { evaluateHpAbove } from "@fight/gambits/resolvers/filters/evaluators/HpAboveEvaluator"
import { evaluateHasPassive } from "@fight/gambits/resolvers/filters/evaluators/HasPassiveEvaluator"
import { evaluateInRange } from "@fight/gambits/resolvers/filters/evaluators/InRangeEvaluator"
import { FilterEvaluatorRegistry } from "@fight/gambits"

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
    registry.register("HAS_PASSIVE", evaluateHasPassive)
    registry.register("IN_RANGE",    evaluateInRange)

    return registry
}