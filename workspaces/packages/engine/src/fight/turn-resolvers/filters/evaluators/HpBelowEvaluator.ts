import { FilterEvaluator, HpBelowFilter } from "@fight/gambits/entityFilters.types"

export const evaluateHpBelow: FilterEvaluator<HpBelowFilter> = (entity, filter, context): boolean =>
    (entity.currentStats.health / entity.baseStats.health) < (filter.threshold / 100)