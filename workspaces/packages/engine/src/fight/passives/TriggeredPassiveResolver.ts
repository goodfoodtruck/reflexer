import { PlayingEntity, ExecutionContext, IFightContextMutator, IFightContextReader, ActionExecutionContext } from "@fight/fight.types"
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
        fightContext: IFightContextMutator & IFightContextReader,
        reactionDepth: number = 0
    ): ActionExecutionContext[] {
        const passives = entity.activePassives
            .map(ap => ap.passive)
            .filter(isTriggeredPassiveOfType(triggerType))

        const contexts: ActionExecutionContext[] = []

        for (const passive of passives) {
            const targetId = this.targetResolver.resolve(entity, fightContext, passive.targetSelector)
            if (!targetId) continue

            contexts.push({
                type: "action",
                casterId: entity.id,
                actionId: passive.triggeredActionId,
                targetId,
                reactionDepth
            })
        }

        return contexts
    }
}