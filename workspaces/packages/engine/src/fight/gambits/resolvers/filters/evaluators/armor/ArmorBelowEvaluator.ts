import { FilterEvaluator, ArmorBelowFilter } from "@fight/gambits/resolvers/filters/entityFilters.types"

export const evaluateArmorBelow: FilterEvaluator<ArmorBelowFilter> = (entity, filter, context): boolean =>
    (entity.currentStats.armor / entity.baseStats.armor) < (filter.threshold / 100)