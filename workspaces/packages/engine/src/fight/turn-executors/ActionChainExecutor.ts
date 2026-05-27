import { IActionRegistry } from "@data/IActionRegistry";
import { FightContext } from "@fight/context/FightContext";
import { ActionLog, ExecutionContext } from "@fight/fight.types";
import { GambitTargetResolver } from "@fight/gambits";
import { EVENT_TO_TRIGGER } from "@fight/passives/passives.types";
import { ProcessorChain } from "@fight/processors/ProcessorChain";
import { ProcessorFactory } from "@fight/processors/ProcessorFactory";
import { isTriggeredPassiveOfType } from "./EntityPassiveExecutor";

const MAX_REACTION_DEPTH = 1

export class ActionChainExecutor {
    constructor(
        private readonly processorFactory: ProcessorFactory,
        private readonly actionRegistry: IActionRegistry,
        private readonly targetResolver: GambitTargetResolver,
        private readonly processorChain: ProcessorChain
    ) {}

    execute(initialContext: ExecutionContext, fightContext: FightContext): ActionLog[] {
        const logs: ActionLog[] = []
        const queue: ExecutionContext[] = [initialContext]

        while (queue.length > 0) {
            const ctx = queue.shift()!
            if (ctx.reactionDepth > MAX_REACTION_DEPTH) continue

            const action = this.actionRegistry.get(ctx.actionId)
            const actionProcessors = 
            [...action.processorConfigs]
                .sort((a, b) => a.order - b.order)
                .map(config => this.processorFactory.create(config))

            const actionLogs = this.processorChain.execute(ctx, actionProcessors, fightContext)
            logs.push(...actionLogs)

            const fightLogs = fightContext.drainLogs()
            const reactions = this.resolveReactions(fightLogs, fightContext, ctx.reactionDepth)
            queue.push(...reactions)
        }

        return logs
    }

    private resolveReactions(
        logs: ActionLog[],
        fightContext: FightContext,
        currentDepth: number
    ): ExecutionContext[] {
        const reactions: ExecutionContext[] = []

        for (const log of logs) {
            const triggerType = EVENT_TO_TRIGGER[log.type]
            if (! triggerType) continue 

            const entityId = fightContext.getAffectedEntityId(log)
            const affectedEntity = fightContext.getEntityById(entityId)
            if (! affectedEntity) continue

            const triggeredPassives = 
            affectedEntity.activePassives
                .map(ap => ap.passive)
                .filter(isTriggeredPassiveOfType(triggerType))

            for (const passive of triggeredPassives) {
                const targetId = this.targetResolver.resolve(affectedEntity, fightContext, passive.targetSelector)
                if (!targetId) continue

                reactions.push({
                    casterId: affectedEntity.id,
                    targetId,
                    actionId: passive.triggeredActionId,
                    reactionDepth: currentDepth + 1
                })
            }
        }

        return reactions
    }
}