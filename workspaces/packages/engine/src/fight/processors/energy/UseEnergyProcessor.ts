import { ActionExecutionContext, ExecutionState, IFightContextMutator, IFightContextReader } from "@fight/fight.types";
import { IProcessor } from "@fight/processors/IProcessor";
import { ProcessorResult, UseEnergyProcessorParams } from "@fight/processors/processor.types";

export class UseEnergyProcessor implements IProcessor {

    constructor(
        private readonly params: UseEnergyProcessorParams
    ) {}

    execute(
        ctx: ActionExecutionContext, 
        execState: ExecutionState,
        fightContext: IFightContextMutator & IFightContextReader
    ): ProcessorResult {
        const target = fightContext.getAliveEntityOrThrow(ctx.casterId)
        const updatedEnergyValue = this.computeUpdatedEnergyValue(target.currentStats.energy, this.params.energyAmount)

        fightContext.updateEnergy({
            targetId: ctx.casterId,
            updatedEnergyValue,
            reactionDepth: ctx.reactionDepth,
        })

        return { status: 'ok', derivedContexts: [] }
    }

    private computeUpdatedEnergyValue(
        availableEnergy: number, 
        energyToUse: number
    ): number {
        // on ne vérifie pas si l'entité a assez d'énergie ici, le CheckEnergyProcessor le fait déjà
        return availableEnergy - energyToUse
    }
}