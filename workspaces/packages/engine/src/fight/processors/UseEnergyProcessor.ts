import { ActionExecutionContext, ExecutionContext, IFightContextMutator, IFightContextReader } from "@fight/fight.types";
import { IProcessor } from "@fight/processors/IProcessor";
import { ProcessorResult } from "@fight/processors/processor.types";

export class UseManaProcessor implements IProcessor {

    constructor(
        private readonly energyValue: number
    ) {}


    execute(
        ctx: ActionExecutionContext, 
        snapshot: IFightContextMutator & IFightContextReader
    ): ProcessorResult {
        const updatedEnergyValue = this.computeUpdatedEnergyValue(snapshot, ctx)

        snapshot.updateEnergy({
            targetId: ctx.casterId,
            updatedEnergyValue,
            reactionDepth: ctx.reactionDepth,
        })

        return { status: 'ok', derivedContexts: [] }
    }

    private computeUpdatedEnergyValue(
        fightContext: IFightContextMutator & IFightContextReader, 
        ctx: ExecutionContext
    ): number {
        return 0
    }
}