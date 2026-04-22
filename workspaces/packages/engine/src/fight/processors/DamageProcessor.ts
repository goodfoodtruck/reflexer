import { FightContext } from "@fight/context/FightContext";
import { IProcessor } from "@processors/IProcessor";
import { ExecutionContext } from "@fight/turn-resolvers/execution-context.types";
import { ProcessorResult } from "@processors/processor.types";
import { ActionLog } from "@fight/fight.types";

export class DamageProcessor implements IProcessor {
    constructor(private readonly damageValue: number) {}

    execute(ctx: ExecutionContext, fightContext: FightContext): ProcessorResult {
        if (fightContext.isEntityDead(ctx.targetId)) {
            return {
                status: 'ok',
                logs: [{ type: 'damage_skipped', reason: 'target_already_dead' }],
            }
        }

        const result = fightContext.applyDamage({
            sourceId: ctx.casterId,
            targetId: ctx.targetId,
            amount: this.damageValue,
            reactionDepth: ctx.reactionDepth,
        })

        const logs: ActionLog[] = [{
            type: 'damage_dealt',
            sourceId: ctx.casterId,
            targetId: ctx.targetId,
            amount: result.actualDamage,
        }]

        if (result.isDead) {
            logs.push({ type: 'entity_died', entityId: ctx.targetId })
        }

        return { status: 'ok', logs }
    }
}