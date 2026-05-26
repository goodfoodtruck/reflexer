import { ActionLog, ExecutionContext } from "@fight/fight.types"
import { IProcessor } from "@processors/IProcessor";
import { IFightContextMutator } from "@fight/fight.types";
import { IFightContextReader } from "@fight/fight.types";

export class ProcessorChain {
    execute(
        executionContext: ExecutionContext,
        processors: Readonly<IProcessor[]>,
        fightContext: IFightContextMutator & IFightContextReader
    ): ActionLog[] {
        const logs: ActionLog[] = []

        for (const processor of processors) {
            const result = processor.execute(executionContext, fightContext)
            logs.push(...result.logs)

            if (result.status === "aborted") {
                logs.push({ type: "action_failed", reason: result.reason })
                return logs
            }
        }

        return logs
    }
}