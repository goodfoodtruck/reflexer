import { FilterEvaluatorRegistry } from "@gambits/resolvers/filters/FilterEvaluatorRegistry";
import { buildFilterRegistry, FilterApplier } from "@gambits/resolvers/filters/FilterApplier";
import { EntityScopeResolver } from "@gambits/resolvers/EntityScopeResolver";
import { GambitTargetResolver } from "@gambits/resolvers/target/GambitTargetResolver";
import { ActionGambitResolver } from "@gambits/resolvers/ActionGambitResolver";
import { ConditionResolver } from "@fight/gambits/resolvers/conditions/ConditionResolver";

export function buildActionGambitResolver(overrides: {
    filterEvaluatorRegistry?: FilterEvaluatorRegistry
    filterApplier?: FilterApplier
    scopeResolver?: EntityScopeResolver
    targetResolver?: GambitTargetResolver
    conditionResolver?: ConditionResolver
} = {}) {
    const scopeResolver = overrides.scopeResolver ?? new EntityScopeResolver()
    const filterApplier = overrides.filterApplier ?? new FilterApplier(buildFilterRegistry())
    const conditionResolver = overrides.conditionResolver ?? new ConditionResolver(filterApplier, scopeResolver)
    const targetResolver = overrides.targetResolver ?? new GambitTargetResolver(conditionResolver, scopeResolver)

    return new ActionGambitResolver(conditionResolver, targetResolver)
}