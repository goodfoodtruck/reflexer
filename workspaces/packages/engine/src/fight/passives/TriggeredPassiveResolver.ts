import { FightContext } from "@fight/context"
import { PlayingEntity, ExecutionContext } from "@fight/fight.types"
import { GambitTargetResolver } from "@fight/gambits"
import { isTriggeredPassiveOfType } from "@fight/turn-executors"
import { PassiveTrigger } from "@fight/passives/passives.types"

export class TriggeredPassiveResolver {

    constructor(
        private readonly targetResolver: GambitTargetResolver
    ) {}

    resolve(
        triggerType: PassiveTrigger,
        entity: PlayingEntity,
        fightContext: FightContext,
        reactionDepth: number = 0
    ): ExecutionContext[] {
        const passives = entity.activePassives
            .map(ap => ap.passive)
            .filter(isTriggeredPassiveOfType(triggerType))

        const contexts: ExecutionContext[] = []

        for (const passive of passives) {
            const targetId = this.targetResolver.resolve(entity, fightContext, passive.targetSelector)
            if (!targetId) continue

            contexts.push({
                casterId: entity.id,
                actionId: passive.triggeredActionId,
                targetId,
                reactionDepth
            })
        }

        return contexts
    }
}