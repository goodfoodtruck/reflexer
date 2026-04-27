import { ProcessorChain } from '@fight/processors/ProcessorChain'
import { Action, ActionID, PlayingEntity } from '@fight/fight.types'
import { EntityActionExecutor } from "@fight/turn-executors/EntityActionExecutor"
import { InMemoryActionRegistry } from "@data/InMemoryActionRegistry"
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder";

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

    const executor = new EntityActionExecutor(registry, new ProcessorChain())

    return { fightContext, executor, registry }
}