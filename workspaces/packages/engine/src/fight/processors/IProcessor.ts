import { FightContext } from "@fight/context/FightContext";
import { ExecutionContext } from "@fight/fight.types";
import { ProcessorResult } from "@processors/processor.types";

export interface IProcessor {
    execute(
        ctx: ExecutionContext,
        snapshot: FightContext
    ): ProcessorResult;
}