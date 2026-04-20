import { ExecutionContext } from "@fight/turn-resolvers/execution-context.types";
import { IProcessor } from "@processors/IProcessor";
import { ProcessorParams, ProcessorResult } from "@processors/processor.types";
import { FightContext } from "@fight/context/FightContext";

export class CheckEnergyProcessor implements IProcessor {
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