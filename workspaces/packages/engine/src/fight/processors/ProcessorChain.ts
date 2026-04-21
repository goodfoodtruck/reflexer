import { ActionLog } from "../fight.types"
import { FightContext } from "../context/FightContext"
import { ExecutionContext } from "@fight/turn-resolvers/execution-context.types";
import { QueuedProcessor } from "@processors/processor.types";
import {IProcessor} from "@processors/IProcessor";

export class ProcessorChain {
    execute(
        executionContext: ExecutionContext,
        processors: Readonly<IProcessor[]>,
        fightContext: FightContext
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