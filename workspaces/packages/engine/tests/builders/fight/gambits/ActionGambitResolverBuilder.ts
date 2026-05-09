import {FilterEvaluatorRegistry} from "@gambits/resolvers/filters/FilterEvaluatorRegistry";
import {buildFilterRegistry, FilterApplier} from "@gambits/resolvers/filters/FilterApplier";
import {EntityScopeResolver} from "@gambits/resolvers/EntityScopeResolver";
import {GambitTargetResolver} from "@gambits/resolvers/target/GambitTargetResolver";
import {ActionGambitResolver} from "@gambits/resolvers/ActionGambitResolver";

export function buildActionGambitResolver(overrides: {
    filterEvaluatorRegistry?: FilterEvaluatorRegistry
    filterApplier?: FilterApplier
    scopeResolver?: EntityScopeResolver
    targetResolver?: GambitTargetResolver
} = {}) {
    const scopeResolver = overrides.scopeResolver ?? new EntityScopeResolver()
    const filterApplier = overrides.filterApplier ?? new FilterApplier(buildFilterRegistry())
    const targetResolver = overrides.targetResolver ?? new GambitTargetResolver(scopeResolver)

    return new ActionGambitResolver(targetResolver, filterApplier, scopeResolver)
}