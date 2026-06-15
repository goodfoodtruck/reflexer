import { IActionRegistry } from "@data/IActionRegistry";
import { ActionExecutionContext, ActionLog, ExecutionContext, IFightContextMutator, IFightContextReader, MovementExecutionContext } from "@fight/fight.types";
import { ProcessorChain } from "@fight/processors/ProcessorChain";
import { ProcessorFactory } from "@fight/processors/ProcessorFactory";
import { ProcessorResult } from "@fight/processors/processor.types";
import { TriggeredPassiveResolver } from "@fight/passives/TriggeredPassiveResolver";
import { WalkProcessor } from "@fight/processors/move/WalkProcessor";

const MAX_REACTION_DEPTH = 1

export type ActionOutcome =
    | { status: "executed"; logs: ActionLog[] }
    | { status: "aborted"; reason: string; logs: ActionLog[] }

export class ActionChainExecutor {
    constructor(
        private readonly processorFactory: ProcessorFactory,
        private readonly actionRegistry: IActionRegistry,
        private readonly triggeredPassiveResolver: TriggeredPassiveResolver,
        private readonly processorChain: ProcessorChain
    ) {}

    attempt(
        initialContext: ExecutionContext,
        fightContext: IFightContextMutator & IFightContextReader
    ): ActionOutcome {
        const logs: ActionLog[] = []
        const queue: ExecutionContext[] = [initialContext]
        let abortReason: string | null = null

        while (queue.length > 0) {
            const ctx = queue.shift()!

            // seules les actions ont une profondeur de réaction
            if (ctx.type === "action" && ctx.reactionDepth > MAX_REACTION_DEPTH) continue

            const result = ctx.type === "action"
                ? this.executeAction(ctx, fightContext)
                : this.executeMovement(ctx, fightContext)

            const fightLogs = fightContext.drainLogs()
            logs.push(...fightLogs)

            if (result.status === "aborted") {
                if (ctx === initialContext) abortReason = result.reason
                continue
            }

            const reactionDepth = ctx.type === "action" ? ctx.reactionDepth : 0
            const reactions = this.resolveTriggeredPassivesReactions(fightLogs, fightContext, reactionDepth)

            queue.unshift(...result.derivedContexts)
            queue.push(...reactions)
        }

        if (abortReason !== null) {
            const failureLog: ActionLog[] = initialContext.type === "action"
                ? [{ type: "action_failed", reason: abortReason }]
                : []
            return { status: "aborted", reason: abortReason, logs: [...logs, ...failureLog] }
        }

        return { status: "executed", logs }
    }

    execute(
        initialContext: ExecutionContext,
        fightContext: IFightContextMutator & IFightContextReader
    ): ActionLog[] {
        const { logs } = this.attempt(initialContext, fightContext);
        return logs;
    }

    private executeAction(
        ctx: ActionExecutionContext,
        fightContext: IFightContextMutator & IFightContextReader
    ): ProcessorResult {
        const action = this.actionRegistry.get(ctx.actionId)
        const processors = [...action.processorConfigs]
            .sort((a, b) => a.order - b.order)
            .map(config => this.processorFactory.create(config))

        return this.processorChain.execute(ctx, processors, fightContext)
    }

    private executeMovement(
        ctx: MovementExecutionContext,
        fightContext: IFightContextMutator & IFightContextReader
    ): ProcessorResult {
        return this.processorChain.execute(ctx, [new WalkProcessor()], fightContext)
    }

    private resolveTriggeredPassivesReactions(
        logs: ActionLog[],
        fightContext: IFightContextMutator & IFightContextReader,
        currentDepth: number
    ): ExecutionContext[] {
        const reactions: ExecutionContext[] = []

        for (const log of logs) {
            const entityId = fightContext.getAffectedEntityId(log)
            if (! entityId) continue
            const affectedEntity = fightContext.getEntityById(entityId)
            if (! affectedEntity) continue

            reactions.push(...this.triggeredPassiveResolver.resolve(
                log.type,
                affectedEntity,
                fightContext,
                currentDepth + 1
            ))
        }

        return reactions
    }
}