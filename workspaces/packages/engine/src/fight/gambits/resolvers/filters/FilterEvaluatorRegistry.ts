import { AnyFilter, FilterEvaluator, FilterType } from "@fight/gambits/resolvers/filters/entityFilters.types"

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