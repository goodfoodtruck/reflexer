import { IActionRegistry } from "@data/IActionRegistry";
import { FightContext } from "@fight/context/FightContext";
import { ActionLog, ExecutionContext } from "@fight/fight.types";
import { ProcessorChain } from "@fight/processors/ProcessorChain";
import { ProcessorFactory } from "@fight/processors/ProcessorFactory";
import { TriggeredPassiveResolver } from "@fight/passives/TriggeredPassiveResolver";

const MAX_REACTION_DEPTH = 1

export class ActionChainExecutor {
    constructor(
        private readonly processorFactory: ProcessorFactory,
        private readonly actionRegistry: IActionRegistry,
        private readonly triggeredPassiveResolver: TriggeredPassiveResolver,
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
            const triggerType = log.type

            const entityId = fightContext.getAffectedEntityId(log)
            const affectedEntity = fightContext.getEntityById(entityId)
            if (! affectedEntity) continue

            reactions.push(...this.triggeredPassiveResolver.resolve(
                triggerType,
                affectedEntity,
                fightContext,
                currentDepth + 1
            ))
        }

        return reactions
    }
}