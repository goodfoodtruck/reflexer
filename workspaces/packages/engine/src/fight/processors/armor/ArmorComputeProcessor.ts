import { ActionExecutionContext, ExecutionState, IFightContextReader } from "@fight/fight.types";
import { IProcessor } from "@processors/IProcessor";
import { ProcessorResult } from "@processors/processor.types";

export class ArmorComputeProcessor implements IProcessor {

    execute(
        ctx: ActionExecutionContext, 
        state: ExecutionState, 
        fightContext: IFightContextReader
    ): ProcessorResult {
        const target = fightContext.getEntityById(ctx.targetId)
        if (! target) return { 
            status: "aborted", 
            reason: "target_not_found" 
        }

        const armor = target.baseStats.armor
        const damageReceivedModifier = fightContext.getModifier(ctx.targetId, "damageReceivedModifier")
        state.computedDamage = this.applyArmor(state.computedDamage, armor, damageReceivedModifier)

        return { 
            status: "ok", 
            derivedContexts: []
        }
    }

    private applyArmor(
        damage: number, 
        armor: number, 
        damageReceivedModifier: number
    ): number {
        // on applique la réduction en % et la réduction en dégats fixes (armor)
        const finalDamage = Math.floor(damage * (1 - damageReceivedModifier / 100)) - armor
        return Math.max(0, finalDamage)
    }
}