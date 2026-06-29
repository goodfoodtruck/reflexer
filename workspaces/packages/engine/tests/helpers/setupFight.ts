import { ProcessorChain } from '@fight/processors/ProcessorChain'
import { Action, ActionID, PlayingEntity } from '@fight/fight.types'
import { InMemoryActionRegistry } from "@data/InMemoryActionRegistry"
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder";
import { InMemoryPassiveRegistry } from '@data/InMemoryPassiveRegistry';
import { ProcessorFactory } from '@fight/processors/ProcessorFactory';
import { ActionChainExecutor } from '@fight/turn-executors';
import { FilterApplier, EntityScopeResolver, GambitTargetResolver, ConditionResolver, buildFilterRegistry } from '@fight/gambits';
import { TriggeredPassiveResolver } from '@fight/passives/TriggeredPassiveResolver';

interface SetupFightConfig {
    players?: Partial<PlayingEntity>[]
    enemies?: Partial<PlayingEntity>[]
    actions?: Record<string, Action>
}

export function setupFight(config: SetupFightConfig = {}) {
    const fightContext = buildFightContext(
        config.players ?? [{}],
        config.enemies ?? [{}],
    )

    const registry = new InMemoryActionRegistry(
        Object.entries(config.actions ?? {}).map(([id, action]) => ({
            ...action,
            id: id as ActionID,
        })),
    )

    const passiveRegistry = new InMemoryPassiveRegistry({})
    const processorFactory = new ProcessorFactory(passiveRegistry)
    const filterApplier = new FilterApplier(buildFilterRegistry())
    const entityScopeResolver = new EntityScopeResolver()
    const conditionResolver = new ConditionResolver(filterApplier, entityScopeResolver)
    const targetResolver = new GambitTargetResolver(conditionResolver, entityScopeResolver)
    const triggeredPassiveResolver = new TriggeredPassiveResolver(targetResolver)

    const executor = new ActionChainExecutor(processorFactory, registry, triggeredPassiveResolver, new ProcessorChain())

    return { fightContext, executor, registry }
}