import {
    ActionGambit, ActionIntent,
    ConditionGroup,
    ETargetType,
    ExistsCondition,
    Gambit,
    MovementGambit, MovementIntent, MovementStrategy
} from "@gambits/gambits.types";
import { buildTargetSelector } from "@tests/builders/fight/gambits/TargetSelectorBuilder";

// Gambits
export function buildGambit(overrides: Partial<Gambit> = {}): Gambit {
    return {
        id: "test_gambit",
        priority: 1,
        conditions: buildExistsCondition(),
        intent: buildActionIntent(),
        targetSelector: buildTargetSelector(),
        ...overrides
    }
}

export function buildActionGambit(overrides: Partial<ActionGambit> = {}): ActionGambit {
    return {
        ...buildGambit(),
        intent: buildActionIntent(),
        ...overrides
    } as ActionGambit
}

export function buildMovementGambit(overrides: Partial<MovementGambit> = {}): MovementGambit {
    return {
        ...buildGambit(),
        intent: buildMovementIntent(),
        ...overrides
    } as MovementGambit
}

// Intents
export function buildActionIntent(overrides: Partial<ActionIntent> = {}): ActionIntent {
    return {
        kind: "ACTION",
        actionId: "attack_basic",
        ...overrides
    }
}

export function buildMovementIntent(overrides: Partial<MovementIntent> = {}): MovementIntent {
    return {
        kind: "MOVEMENT",
        strategy: "APPROACH" as MovementStrategy,
        ...overrides
    }
}

// Conditions
export function buildExistsCondition(
    overrides: Partial<ExistsCondition> = {}
): ExistsCondition {
    return {
        type: "EXISTS",
        context: { targetType: ETargetType.ENEMY, filters: [] },
        threshold: 1,
        ...overrides
    }
}

export function buildAndCondition(
    conditions: ConditionGroup[]
): ConditionGroup {
    return { operator: "AND", conditions }
}

export function buildOrCondition(
    conditions: ConditionGroup[]
): ConditionGroup {
    return { operator: "OR", conditions }
}

export function buildNotCondition(
    condition: ConditionGroup
): ConditionGroup {
    return { operator: "NOT", condition }
}