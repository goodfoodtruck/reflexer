import { FightContext } from "@fight/context/FightContext";
import { IProcessor } from "@processors/IProcessor";
import { ProcessorResult } from "@processors/processor.types";
import { ActionLog, ExecutionContext } from "@fight/fight.types";

export class DamageProcessor implements IProcessor {
    constructor(private readonly damageValue: number) {}

    execute(ctx: ExecutionContext, fightContext: FightContext): ProcessorResult {
        if (fightContext.isEntityDead(ctx.targetId)) {
            return {
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
        }

        const finalDamage = this.computeTotalDamage(fightContext, ctx)

        const result = fightContext.applyDamage({
            sourceId: ctx.casterId,
            targetId: ctx.targetId,
            amount: finalDamage,
            reactionDepth: ctx.reactionDepth,
        })

        const logs: ActionLog[] = [{
            type: 'damage_dealt',
            sourceId: ctx.casterId,
            targetId: ctx.targetId,
            amount: result.actualDamage,
            reactionDepth: ctx.reactionDepth,
        }]

        if (result.isDead) {
            logs.push({ type: 'entity_died', entityId: ctx.targetId })
        }

        return { status: 'ok', logs }
    }

    private computeTotalDamage(fightContext: FightContext, ctx: ExecutionContext): number {
        const dealtModifier = fightContext.getModifier(ctx.casterId, "damageDealtModifier")
        const receivedModifier = fightContext.getModifier(ctx.targetId, "damageReceivedModifier")
        const totalModifier = dealtModifier + receivedModifier

        const finalDamage = this.damageValue * (1 + totalModifier / 100)

        return Math.max(0, Math.floor(finalDamage))
    }
}