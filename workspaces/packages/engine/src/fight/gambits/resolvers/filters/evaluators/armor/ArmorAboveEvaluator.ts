import { FilterEvaluator, ArmorAboveFilter } from "@fight/gambits/resolvers/filters/entityFilters.types"

export const evaluateArmorAbove: FilterEvaluator<ArmorAboveFilter> = (entity, filter, context): boolean =>
    (entity.currentStats.armor / entity.baseStats.armor) > (filter.threshold / 100)