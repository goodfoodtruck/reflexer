import { ActionExecutionContext, IFightContextMutator, IFightContextReader } from "@fight/fight.types"
import { IProcessor } from "@fight/processors/IProcessor"
import { ProcessorResult } from "@fight/processors/processor.types"

export class EnergyProcessor implements IProcessor {

    constructor(
        private readonly neededEnergy: number
    ) {}

    execute(
        ctx: ActionExecutionContext, 
        fightContext: IFightContextMutator & IFightContextReader
    ): ProcessorResult {
        const actionCaster = fightContext.getAliveEntityOrThrow(ctx.casterId)
        const hasEnergyEnough = (actionCaster.currentStats.energy >= this.neededEnergy)

        if (! hasEnergyEnough) 
            return { status: 'aborted', reason: 'action_failed' }

        const updatedEnergyValue = this.getEnergyValueAfterUsage(actionCaster.currentStats.energy, this.neededEnergy)

        fightContext.updateEnergy({
            targetId: ctx.casterId,
            updatedEnergyValue,
            reactionDepth: ctx.reactionDepth
        })

        return { status: 'ok', derivedContexts: [] }
    }

    private getEnergyValueAfterUsage(
        availableEnergy: number, 
        neededEnergy: number
    ): number {
        return availableEnergy - neededEnergy
    }
}