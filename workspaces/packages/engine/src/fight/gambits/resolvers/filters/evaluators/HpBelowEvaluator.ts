import { FilterEvaluator, HpBelowFilter } from "@fight/gambits/resolvers/filters/entityFilters.types"

export const evaluateHpBelow: FilterEvaluator<HpBelowFilter> = (entity, filter, context): boolean =>
    (entity.currentStats.health / entity.baseStats.health) < (filter.threshold / 100)