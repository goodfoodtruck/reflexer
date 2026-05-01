import { FilterEvaluator, HpAboveFilter } from "@fight/gambits/entityFilters.types"

export const evaluateHpAbove: FilterEvaluator<HpAboveFilter> = (entity, filter, context): boolean =>
    (entity.currentStats.health / entity.baseStats.health) > (filter.threshold / 100)