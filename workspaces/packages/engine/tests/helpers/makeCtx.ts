import { ActionExecutionContext, MovementExecutionContext, ActionID, PlayingEntityID } from '@fight/fight.types'

export function makeActionCtx(overrides: Partial<ActionExecutionContext> = {}): ActionExecutionContext {
    return {
        type: "action",
        actionId: 'test_action' as ActionID,
        casterId: 'caster' as PlayingEntityID,
        targetId: 'target' as PlayingEntityID,
        reactionDepth: 0,
        ...overrides,
    }
}

export function makeMovementCtx(overrides: Partial<MovementExecutionContext> = {}): MovementExecutionContext {
    return {
        type: "movement",
        casterId: 'caster' as PlayingEntityID,
        targetCell: { x: 0, y: 0 },
        ...overrides,
    }
}