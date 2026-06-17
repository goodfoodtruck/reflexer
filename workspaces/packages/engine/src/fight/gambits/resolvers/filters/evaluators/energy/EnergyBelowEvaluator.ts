import { FilterEvaluator, EnergyBelowFilter } from "@fight/gambits/resolvers/filters/entityFilters.types"

export const evaluateEnergyBelow: FilterEvaluator<EnergyBelowFilter> = (entity, filter, context): boolean =>
    (entity.currentStats.energy / entity.baseStats.energy) < (filter.threshold / 100)