import { ActionExecutionContext, ExecutionState, IFightContextMutator, IFightContextReader } from "@fight/fight.types";
import { IProcessor } from "@processors/IProcessor";
import { CheckEnergyProcessorParams, ProcessorResult } from "@processors/processor.types";

export class CheckEnergyProcessor implements IProcessor {

    constructor(private readonly params: CheckEnergyProcessorParams) {}

    execute(
        ctx: ActionExecutionContext, 
        execState: ExecutionState,
        fightContext: IFightContextReader
    ): ProcessorResult {
        const actionCaster = fightContext.getAliveEntityOrThrow(ctx.casterId)

        if (fightContext.isEntityDead(ctx.targetId)) {
            return {
                status: 'aborted',
                reason: 'target_already_dead'
            }
        }

        if (actionCaster.currentStats.energy < this.params.neededEnergy)
            return { status: 'aborted', reason: 'not_enough_energy' }

        execState.computedEnergy = this.params.neededEnergy

        return { status: "ok", derivedContexts: [] }
    }
}