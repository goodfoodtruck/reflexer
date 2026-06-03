import { ActionExecutionContext, ExecutionState, IFightContextMutator, IFightContextReader } from "@fight/fight.types";
import { IProcessor } from "@processors/IProcessor";
import { ComputeHealProcessorParams, ProcessorResult } from "@processors/processor.types";

export class HealComputeProcessor implements IProcessor {

    constructor(
        private readonly params: ComputeHealProcessorParams
    ) {}

    execute(
        ctx: ActionExecutionContext, 
        execState: ExecutionState, 
        fightContext: IFightContextMutator & IFightContextReader
    ): ProcessorResult {
        const target = fightContext.getEntityById(ctx.targetId)
        if (! target) return { status: "aborted", reason: "target_not_found" }

        const healReductionModifier = fightContext.getModifier(ctx.targetId, "healReductionModifier")
        const healDealtModifier = fightContext.getModifier(ctx.casterId, "healDealtModifier")

        const finalHeal = this.computeHeal(this.params.healAmount, healDealtModifier + healReductionModifier)

        execState.computedHeal = Math.max(0, finalHeal)

        return {
            status: 'ok',
            derivedContexts: []
        }
    }

    private computeHeal(baseAmount: number, modifier: number): number {
        return Math.floor(baseAmount * (1 + modifier / 100))
    }
}