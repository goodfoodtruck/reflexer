import { FightContext } from "@fight/context/FightContext";
import { ProcessorResult } from "@processors/processor.types";
import { ExecutionContext } from "@fight/turn-resolvers/execution-context.types";

export interface IProcessor {
    execute(
        ctx: ExecutionContext,
        snapshot: FightContext
    ): ProcessorResult;
}