import { ActionGambit, ConditionGroup, ExistsCondition, Gambit, MovementGambit } from "@fight/gambits/gambits.types";

export const isActionGambit = (gambit: Gambit): gambit is ActionGambit =>
    gambit.intent.kind === "ACTION"

export const isMovementGambit = (gambit: Gambit): gambit is MovementGambit =>
    gambit.intent.kind === "MOVEMENT"

export const isExistsCondition = (condition: ConditionGroup): condition is ExistsCondition => {
        return "type" in condition && condition.type === "EXISTS"
    }