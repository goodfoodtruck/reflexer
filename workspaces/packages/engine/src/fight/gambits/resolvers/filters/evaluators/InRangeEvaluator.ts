import { FilterEvaluator, InRangeFilter } from "@fight/gambits/resolvers/filters/entityFilters.types"
import { manhattanDistance } from "@helpers/map/utils"

export const evaluateInRange: FilterEvaluator<InRangeFilter> = (entity, filter, context): boolean =>
    manhattanDistance(context.source.position, entity.position) <= filter.range
