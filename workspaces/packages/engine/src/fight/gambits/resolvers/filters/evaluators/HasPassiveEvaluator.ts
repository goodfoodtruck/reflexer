import { FilterEvaluator, HasPassiveFilter } from "@fight/gambits/resolvers/filters/entityFilters.types"

export const evaluateHasPassive: FilterEvaluator<HasPassiveFilter> = (entity, filter, context): boolean =>
     entity.activePassives.some(ap => ap.passive.id === filter.passiveId)