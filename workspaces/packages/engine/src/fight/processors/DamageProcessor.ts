import { FightContext } from "@fight/context/FightContext";
import { IProcessor } from "@processors/IProcessor";
import { ExecutionContext } from "@fight/turn-resolvers/execution-context.types";
import { ProcessorParams, ProcessorResult } from "@processors/processor.types";

export class DamageProcessor implements IProcessor {
    execute(
        ctx: ExecutionContext,
        params: ProcessorParams,
        fightContext: FightContext
    ): ProcessorResult {
        return {
            status: "aborted",
            reason: "TODO",
            logs: [{}]
        }
    }
}