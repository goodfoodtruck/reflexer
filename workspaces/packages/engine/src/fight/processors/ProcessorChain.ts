import { ExecutionContext } from "@fight/fight.types"
import { IProcessor } from "@processors/IProcessor";
import { IFightContextMutator } from "@fight/fight.types";
import { IFightContextReader } from "@fight/fight.types";

export class ProcessorChain {
    
    execute(
        executionContext: ExecutionContext,
        processors: Readonly<IProcessor[]>,
        fightContext: IFightContextMutator & IFightContextReader
    ): ExecutionContext[] {
        const derivedContexts: ExecutionContext[] = []
        for (const processor of processors) {
            const result = processor.execute(executionContext, fightContext)
            if (result.status === "aborted") return []

            derivedContexts.push(...result.derivedContexts)
        }

        return derivedContexts
    }
}