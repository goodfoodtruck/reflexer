import { FightContext } from "@fight/context/FightContext"
import { PlayingEntity } from "@fight/fight.types"
import { FilterEvaluator, FilterType } from "@fight/gambits/entityFilters.types"
import { evaluateHpBelow } from "./evaluators/HpBelowEvaluator"
import { evaluateHpAbove } from "./evaluators/HpAboveEvaluator"
import { evaluateHasStatus } from "./evaluators/HasStatusEvaluator"

class EntityFilterEvaluatorRegistry {

    private evaluators = new Map<FilterType, FilterEvaluator<FilterType>>()

    register(type: FilterType, evaluator: FilterEvaluator<any>): void {
        this.evaluators.set(type, evaluator)
    }

    evaluate(entity: PlayingEntity, filterType: FilterType, context: Readonly<FightContext>): boolean {
        const evaluator = this.evaluators.get(filterType)
        if (! evaluator) 
            throw new Error(`Filtre ${filterType} non enregistré`)
        return evaluator(entity, filterType, context)
    }

    applyAll(entities: PlayingEntity[], filters: FilterType[], context: Readonly<FightContext>): PlayingEntity[] {
        return entities.filter(entity =>
            filters.every(filter => this.evaluate(entity, filter, context))
        )
    }
}

export const buildFilterRegistry = (): EntityFilterEvaluatorRegistry => {
    const registry = new EntityFilterEvaluatorRegistry()

    registry.register("HP_BELOW",   evaluateHpBelow)
    registry.register("HP_ABOVE",   evaluateHpAbove)
    registry.register("HAS_STATUS", evaluateHasStatus)

    return registry
}