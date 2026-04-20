import { ActionLog } from "../fight.types"
import { FightContext } from "../context/FightContext"
import { ExecutionContext } from "@fight/turn-resolvers/execution-context.types";
import { ProcessorConfig } from "@processors/processor.types";

export class ProcessorChain {
    execute(
        executionContext: ExecutionContext,
        configs: Readonly<ProcessorConfig[]>,
        fightContext: FightContext
    ): ActionLog[] {

        return [];
    }
}