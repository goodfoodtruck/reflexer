import { ActionExecutionContext, IFightContextMutator, IFightContextReader } from "@fight/fight.types";
import { IProcessor } from "@processors/IProcessor";
import { CheckEnergyProcessorParams, ProcessorResult } from "@processors/processor.types";

export class CheckEnergyProcessor implements IProcessor {

    constructor(private readonly params: CheckEnergyProcessorParams) {}

    execute(ctx: ActionExecutionContext, snapshot: IFightContextMutator & IFightContextReader): ProcessorResult {
        const actionCaster = snapshot.getAliveEntityOrThrow(ctx.casterId)

        if (snapshot.isEntityDead(ctx.targetId)) {
            return {
                status: 'aborted',
                reason: 'target_already_dead'
            }
        }

        if (actionCaster.currentStats.energy < this.params.neededEnergy) 
            return { status: 'aborted', reason: 'not_enough_energy' }
        
        return { status: "ok", derivedContexts: [] }
    }
}