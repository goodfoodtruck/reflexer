import { ActionExecutionContext, ExecutionState, IFightContextMutator } from "@fight/fight.types";
import { IProcessor } from "@processors/IProcessor";
import { ApplyDamageProcessorParams, ProcessorResult } from "@processors/processor.types";

export class DamageApplyProcessor implements IProcessor {
    execute(
        ctx: ActionExecutionContext, 
        execState: ExecutionState,
        fightContext: IFightContextMutator
    ): ProcessorResult {
        fightContext.applyDamage({
            actionId: ctx.actionId,
            sourceId: ctx.casterId,
            targetId: ctx.targetId,
            amount: execState.computedDamage,
            reactionDepth: ctx.reactionDepth,
        })

        return { status: 'ok', derivedContexts: [] }
    }
}