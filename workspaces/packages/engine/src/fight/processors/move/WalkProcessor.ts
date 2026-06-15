import { IProcessor } from "@processors/IProcessor";
import { ExecutionState, MovementExecutionContext } from "@fight/fight.types";
import { FightContext } from "@fight/context/FightContext";
import { ProcessorResult } from "@processors/processor.types";

export class WalkProcessor implements IProcessor {

    execute(
        ctx: MovementExecutionContext, 
        execState: ExecutionState,
        fightContext: FightContext
    ): ProcessorResult {
        fightContext.moveEntity({ entityId: ctx.casterId, destination: ctx.targetCell })

        return { status: "ok", derivedContexts: [] }
    }
}