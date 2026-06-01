import { ActionExecutionContext, ExecutionState } from "@fight/fight.types";
import { IProcessor } from "@processors/IProcessor";
import { ApplyDamageProcessorParams, ProcessorResult } from "@processors/processor.types";
import { FightContext } from "@fight/context";

export class DamageApplyProcessor implements IProcessor {

    constructor(
        private readonly params: ApplyDamageProcessorParams = {}
    ) {}

    execute(
        ctx: ActionExecutionContext, 
        execState: ExecutionState,
        fightContext: FightContext
    ): ProcessorResult {
        fightContext.applyDamage({
            sourceId: ctx.casterId,
            targetId: ctx.targetId,
            amount: execState.computedDamage,
            reactionDepth: ctx.reactionDepth,
        })

        return { status: 'ok', derivedContexts: [] }
    }
}