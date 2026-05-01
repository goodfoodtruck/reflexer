import { FilterEvaluator, HasStatusFilter } from "@fight/gambits/entityFilters.types"

export const evaluateHasStatus: FilterEvaluator<HasStatusFilter> = (entity, filter, context): boolean =>
    entity.statuses.includes(filter.status)