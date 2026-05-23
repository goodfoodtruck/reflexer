import { FightContext } from "@fight/context/FightContext"
import { ExecutionContext } from "@fight/fight.types"
import { IProcessor } from "./IProcessor"
import { ProcessorResult } from "./processor.types"
import { PassiveConfigID } from "@fight/passives/passives.types"
import { IPassiveRegistry } from "@data/IPassiveRegistry"

export class PassiveApplierProcessor implements IProcessor {

    constructor(
        private readonly registry: IPassiveRegistry,
        private readonly passiveConfigId: PassiveConfigID, 
        private readonly duration: number | "PERMANENT"
    ) {}

    execute(ctx: ExecutionContext, fightContext: FightContext): ProcessorResult {
        const target = fightContext.getEntityById(ctx.targetId)
        if (! target) return {
            status: 'aborted',
            reason: 'target_already_dead',
            logs: [
                {
                    targetId: ctx.targetId,
                    type: 'damage_skipped',
                    reason: 'target_already_dead'
                }
            ],
        }

        const passive = this.registry.getPassive(this.passiveConfigId)

        fightContext.applyPassive(target.id, {
            passive,
            remainingTurns: this.duration,
            sourceEntityId: ctx.casterId
        })

        return { 
            status: 'ok', 
            logs: [{ 
                type: "passive_applied", 
                entityId: ctx.targetId, 
                passiveConfigId: this.passiveConfigId
            }] 
        }
    }
}