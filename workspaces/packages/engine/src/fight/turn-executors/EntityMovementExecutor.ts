import { IFightContextMutator, MovementExecutionContext } from "@fight/fight.types";
import { IFightContextReader } from "@fight/fight.types";
import { ActionLog, MovementContext } from "@fight/fight.types";
import { Position } from "@helpers/types/helpers.types";
import { ActionChainExecutor } from ".";

export class EntityMovementExecutor {
    constructor(
        private readonly actionChainExecutor: ActionChainExecutor,
    ) {}

    execute(
        path: Position[],
        movementContext: MovementContext,
        fightContext: IFightContextMutator & IFightContextReader
    ): ActionLog[] {

        const logs: ActionLog[] = []

        for (const cell of path) {

            const executionContext: MovementExecutionContext = {
                type: "movement",
                casterId: movementContext.casterId,
                targetCell: cell
            }

            const cellLogs = this.actionChainExecutor.execute(executionContext, fightContext)
            logs.push(...cellLogs)
        }

        return logs;
    }
}