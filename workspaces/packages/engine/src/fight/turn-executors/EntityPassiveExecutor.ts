import { ActionLog, ExecutionContext, PlayingEntity } from "@fight/fight.types";
import { FightContext } from "@fight/context/FightContext";
import { Passive, PassiveTrigger, TriggeredPassive } from "@fight/passives/passives.types";
import { GambitTargetResolver } from "@fight/gambits/resolvers/target/GambitTargetResolver";
import { EntityActionExecutor } from "@fight/turn-executors/EntityActionExecutor";

const isTriggeredPassiveOfType = (triggerType: PassiveTrigger) => {
        return (passive: Passive): passive is TriggeredPassive =>
        passive.kind === "TRIGGERED" && passive.triggerType === triggerType
}

export class EntityPassiveExecutor {

    constructor(
        private readonly targetResolver: GambitTargetResolver,
        private readonly actionExecutor: EntityActionExecutor
    ) {}

    executePassiveTrigger(
        triggerType: PassiveTrigger,
        entity: PlayingEntity, 
        fightContext: FightContext
    ): ActionLog[] {
        const logs: ActionLog[] = []

        const passives = entity.activePassives.map(ap => ap.passive).filter(isTriggeredPassiveOfType(triggerType))

        for (const passive of passives) {
            const actionTargetId = this.targetResolver.resolve(entity, fightContext, passive.targetSelector)
            if (! actionTargetId) continue

            const executionContext: ExecutionContext = {
                casterId: entity.id,
                actionId: passive.triggeredActionId,
                targetId: actionTargetId,
                reactionDepth: 0
            }

            logs.push(...this.actionExecutor.execute(executionContext, fightContext))
        }
        
        return logs
    }
}