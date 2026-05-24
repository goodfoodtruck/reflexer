import { ActionLog, ExecutionContext, IReactiveContext } from "@fight/fight.types"
import { QueuedProcessor } from "@processors/processor.types";
import { IProcessor } from "@processors/IProcessor";
import { IFightContextMutator } from "@fight/fight.types";
import { IFightContextReader } from "@fight/fight.types";

export class ProcessorChain {
    execute(
        executionContext: ExecutionContext,
        processors: Readonly<IProcessor[]>,
        fightContext: IFightContextMutator & IFightContextReader & IReactiveContext
    ): ActionLog[] {

        const logs: ActionLog[] = []
        const queue: QueuedProcessor[] = processors.map(processor => ({
            processor,
            context: executionContext,
        }))

        while (queue.length > 0) {

            const { processor, context } = queue.shift()!
            const result = processor.execute(context, fightContext)
            logs.push(...result.logs)

            if (result.status === 'aborted') {
                logs.push({ type: 'action_failed', reason: result.reason })
                return logs
            }

            // Les réactions déclenchées par ce processor passent en tête (LIFO)
            const reactions = fightContext.drainReactions()
            if (reactions.length > 0) queue.unshift(...reactions)
        }

        return logs
    }
}