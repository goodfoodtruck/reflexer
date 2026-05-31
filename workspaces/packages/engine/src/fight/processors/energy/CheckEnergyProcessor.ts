import { ActionExecutionContext, ExecutionContext, IFightContextMutator, IFightContextReader } from "@fight/fight.types";
import { IProcessor } from "../IProcessor";
import { ProcessorResult } from "../processor.types";

export class CheckEnergyProcessor implements IProcessor {

    constructor(
        private readonly energyValue: number
    ) {}

    execute(ctx: ActionExecutionContext, snapshot: IFightContextMutator & IFightContextReader): ProcessorResult {
        const actionCaster = snapshot.getAliveEntityOrThrow(ctx.casterId)

        if (snapshot.isEntityDead(ctx.targetId)) {
            return {
                status: 'aborted',
                reason: 'target_already_dead'
            }
        }

        if (actionCaster.currentStats.energy < this.energyValue) 
            return { status: 'aborted', reason: 'action_failed' }
        
        return {
            status: "ok",
            derivedContexts: []
        }
    }
}