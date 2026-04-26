import { ActionID, PlayingEntityID } from '@fight/fight.types'
import { ExecutionContext } from "@fight/turn-resolvers/execution-context.types";

export function makeCtx(overrides: Partial<ExecutionContext> = {}): ExecutionContext {
    return {
        actionId: 'test_action' as ActionID,
        casterId: 'caster' as PlayingEntityID,
        targetId: 'target' as PlayingEntityID,
        reactionDepth: 0,
        ...overrides,
    }
}