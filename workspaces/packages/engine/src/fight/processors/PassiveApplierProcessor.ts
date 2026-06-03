import { FightContext } from "@fight/context/FightContext"
import { ActionExecutionContext, ExecutionState } from "@fight/fight.types"
import { IProcessor } from "./IProcessor"
import { PassiveProcessorParams, ProcessorResult } from "./processor.types"
import { IPassiveRegistry } from "@data/IPassiveRegistry"

export class PassiveApplierProcessor implements IProcessor {

    constructor(
        private readonly passiveRegistry: IPassiveRegistry,
        private readonly params: PassiveProcessorParams
    ) {}

    execute(
        ctx: ActionExecutionContext, 
        execState: ExecutionState,
        fightContext: FightContext
    ): ProcessorResult {
        const target = fightContext.getEntityById(ctx.targetId)
        if (! target) return {
            status: 'aborted',
            reason: 'target_already_dead'
        }

        const passive = this.passiveRegistry.getPassive(this.params.passiveId)

        fightContext.applyPassive(target.id, {
            passive,
            remainingTurns: this.params.duration,
            sourceEntityId: ctx.casterId
        })

        return { 
            status: 'ok', 
            derivedContexts: []
        }
    }
}