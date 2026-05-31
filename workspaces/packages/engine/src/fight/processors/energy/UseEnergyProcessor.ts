import { ActionExecutionContext, IFightContextMutator, IFightContextReader } from "@fight/fight.types";
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
        const target = snapshot.getAliveEntityOrThrow(ctx.casterId)
        const updatedEnergyValue = this.computeUpdatedEnergyValue(target.currentStats.energy, this.energyValue)

        snapshot.updateEnergy({
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