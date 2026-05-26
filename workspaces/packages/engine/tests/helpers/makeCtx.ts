import { ActionID, ExecutionContext, PlayingEntityID } from '@fight/fight.types'

export function makeCtx(overrides: Partial<ExecutionContext> = {}): ExecutionContext {
    return {
        actionId: 'test_action' as ActionID,
        casterId: 'caster' as PlayingEntityID,
        targetId: 'target' as PlayingEntityID,
        reactionDepth: 0,
        ...overrides,
    }
}