import { FightContext } from "@fight/context/FightContext";
import { IProcessor } from "@processors/IProcessor";
import { ProcessorResult } from "@processors/processor.types";
import { ActionExecutionContext } from "@fight/fight.types";

export class DamageProcessor implements IProcessor {
    constructor(private readonly damageValue: number) {}

    execute(ctx: ActionExecutionContext, fightContext: FightContext): ProcessorResult {
        const finalDamage = this.computeTotalDamage(fightContext, ctx)

        fightContext.applyDamage({
            sourceId: ctx.casterId,
            targetId: ctx.targetId,
            amount: finalDamage,
            reactionDepth: ctx.reactionDepth,
        })

        return { status: 'ok', derivedContexts: [] }
    }

    private computeTotalDamage(fightContext: FightContext, ctx: ActionExecutionContext): number {
        const dealtModifier = fightContext.getModifier(ctx.casterId, "damageDealtModifier")
        const receivedModifier = fightContext.getModifier(ctx.targetId, "damageReceivedModifier")
        const totalModifier = dealtModifier + receivedModifier

        const finalDamage = this.damageValue * (1 + totalModifier / 100)

        return Math.max(0, Math.floor(finalDamage))
    }
}