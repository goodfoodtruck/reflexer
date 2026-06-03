import { ActionExecutionContext, ExecutionState, IFightContextMutator, IFightContextReader } from "@fight/fight.types";
import { IProcessor } from "@processors/IProcessor";
import { ComputeDamageProcessorParams, ProcessorResult } from "@processors/processor.types";

export class DamageComputeProcessor implements IProcessor {

    constructor(
        private readonly params: ComputeDamageProcessorParams
    ) {}

    execute(
        ctx: ActionExecutionContext,
        execState: ExecutionState,
        fightContext: IFightContextMutator & IFightContextReader
    ): ProcessorResult {
        const dealtModifier = fightContext.getModifier(ctx.casterId, "damageDealtModifier")

        const finalDamage = this.params.initialDamage * (1 + dealtModifier / 100)

        execState.computedDamage = Math.max(0, Math.floor(finalDamage))

        return {
            status: "ok",
            derivedContexts: []
        }
    }
}