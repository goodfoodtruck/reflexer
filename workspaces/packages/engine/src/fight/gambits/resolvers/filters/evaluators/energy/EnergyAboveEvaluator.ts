import { FilterEvaluator, EnergyAboveFilter } from "@fight/gambits/resolvers/filters/entityFilters.types"

export const evaluateEnergyAbove: FilterEvaluator<EnergyAboveFilter> = (entity, filter, context): boolean =>
    (entity.currentStats.energy / entity.baseStats.energy) > (filter.threshold / 100)