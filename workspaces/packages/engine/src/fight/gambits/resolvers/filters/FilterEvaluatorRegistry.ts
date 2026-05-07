import { AnyFilter, FilterEvaluator, FilterType } from "@fight/gambits/resolvers/filters/entityFilters.types"
import { evaluateHpBelow } from "@fight/gambits/resolvers/filters/evaluators/HpBelowEvaluator"
import { evaluateHpAbove } from "@fight/gambits/resolvers/filters/evaluators/HpAboveEvaluator"
import { evaluateHasStatus } from "@fight/gambits/resolvers/filters/evaluators/HasStatusEvaluator"

export class FilterEvaluatorRegistry {

    private evaluators = new Map<FilterType, FilterEvaluator<AnyFilter>>()

    /**
     * Permet d'enregistrer un FilterEvaluator pour un FilterType
     * @param type le type de critère
     * @param evaluator la fonction qui permet de valider si une entité respecte ce critère
     */
    register(type: FilterType, evaluator: FilterEvaluator<any>): void {
        this.evaluators.set(type, evaluator)
    }

    getEvaluator(type: FilterType): FilterEvaluator<AnyFilter> | undefined {
        return this.evaluators.get(type)
    }
}

export const buildFilterRegistry = (): FilterEvaluatorRegistry => {
    const registry = new FilterEvaluatorRegistry()

    registry.register("HP_BELOW",   evaluateHpBelow)
    registry.register("HP_ABOVE",   evaluateHpAbove)
    registry.register("HAS_STATUS", evaluateHasStatus)

    return registry
}