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
        const damageReduction = fightContext.getModifier(ctx.targetId, "damageReductionModifier")
        state.computedDamage = this.applyArmor(state.computedDamage, armor, damageReduction)

        return { 
            status: "ok", 
            derivedContexts: []
        }
    }

    private applyArmor(
        damage: number, 
        armor: number, 
        damageReduction: number
    ): number {
        // on additionne la réduction en % des passifs + de l'armure
        const totalDamageReduction = (damageReduction + armor) / 100
        const finalDamage = Math.round(damage * (1 - totalDamageReduction))

        // on ne descend jamais en dessous de 0 de dégats reçus pour éviter de se soigner
        return Math.max(0, finalDamage)
    }
}