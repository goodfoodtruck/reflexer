import { IFightContextMutator } from "@fight/fight.types";
import { IFightContextReader } from "@fight/fight.types";
import { IReactiveContext } from "@fight/context/IFightContextReactive";
import { ActionLog, ExecutionContext, MovementContext } from "@fight/fight.types";
import { Position } from "@helpers/types/helpers.types";
import { ProcessorChain } from "@processors/ProcessorChain";
import { MOVE_STEP_ACTION_ID } from "@fight/movements/constants";
import { IProcessor } from "@processors/IProcessor";
import { WalkProcessor } from "@processors/WalkProcessor";

export class EntityMovementExecutor {
    constructor(
        private readonly moveProcessorChain: ProcessorChain,
    ) {}

    execute(
        path: Position[],
        movementContext: MovementContext,
        fightContext: IFightContextMutator & IFightContextReader & IReactiveContext
    ): ActionLog[] {

        const logs: ActionLog[] = [];

        for (const cell of path) {

            const executionContext: ExecutionContext = {
                casterId: movementContext.casterId,
                actionId: MOVE_STEP_ACTION_ID, // hardcoded action de mouvement pcq la chain attend un exeCtx
                targetId: movementContext.targetId,
                reactionDepth: 0
            }

            const processors: IProcessor[] = [
                new WalkProcessor(cell),
            ];

            const cellLogs = this.moveProcessorChain.execute(executionContext, processors, fightContext);
            logs.push(...cellLogs);
        }

        return logs;
    }
}