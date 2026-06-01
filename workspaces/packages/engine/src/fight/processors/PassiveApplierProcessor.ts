import { FightContext } from "@fight/context/FightContext"
import { ActionExecutionContext } from "@fight/fight.types"
import { IProcessor } from "./IProcessor"
import { ProcessorResult } from "./processor.types"
import { IPassiveRegistry } from "@data/IPassiveRegistry"
import { PassiveID } from "@fight/passives/passives.types"

export class PassiveApplierProcessor implements IProcessor {

    constructor(
        private readonly registry: IPassiveRegistry,
        private readonly passiveId: PassiveID, 
        private readonly duration: number | "PERMANENT"
    ) {}

    execute(ctx: ActionExecutionContext, fightContext: FightContext): ProcessorResult {
        const target = fightContext.getEntityById(ctx.targetId)
        if (! target) return {
            status: 'aborted',
            reason: 'target_already_dead'
        }

        const passive = this.registry.getPassive(this.passiveId)

        fightContext.applyPassive(target.id, {
            passive,
            remainingTurns: this.duration,
            sourceEntityId: ctx.casterId
        })

        return { 
            status: 'ok', 
            derivedContexts: []
        }
    }
}