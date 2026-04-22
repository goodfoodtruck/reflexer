import { ActionID, PlayingEntityID } from "@fight/fight.types";

export type ExecutionContext = {
    casterId: Readonly<PlayingEntityID>;
    actionId: Readonly<ActionID>;
    targetId: Readonly<PlayingEntityID>;
    reactionDepth: Readonly<number>;
};