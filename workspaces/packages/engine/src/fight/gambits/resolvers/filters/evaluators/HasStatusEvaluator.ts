import { FilterEvaluator, HasStatusFilter } from "@fight/gambits/resolvers/filters/entityFilters.types"

export const evaluateHasStatus: FilterEvaluator<HasStatusFilter> = (entity, filter, context): boolean =>
     entity.statuses.some(status => status.id === filter.status.id)