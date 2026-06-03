import { ActionExecutionContext, ExecutionState, IFightContextMutator } from "@fight/fight.types";
import { IProcessor } from "@processors/IProcessor";
import { ApplyHealProcessorParams, ProcessorResult } from "@processors/processor.types";

export class HealApplyProcessor implements IProcessor {

    constructor(
        private readonly params: ApplyHealProcessorParams
    ) {}


    execute(
        ctx: ActionExecutionContext, 
        execState: ExecutionState, 
        fightContext: IFightContextMutator
    ): ProcessorResult {
        fightContext.applyHeal({
            sourceId: ctx.casterId,
            targetId: ctx.targetId,
            amount: execState.computedHeal,
            reactionDepth: ctx.reactionDepth
        })

        return {
            status: 'ok',
            derivedContexts: []
        }
    }
}